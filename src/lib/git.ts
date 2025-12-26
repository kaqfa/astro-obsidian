import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import simpleGit from 'simple-git';

const VAULT_PATH = './vault';

/**
 * Get git instance with secure credential handling
 * Uses environment variables instead of embedding credentials in URLs
 */
async function getGitWithCredentials() {
  const username = process.env.GIT_USERNAME;
  const token = process.env.GIT_TOKEN;

  if (!username || !token) {
    return simpleGit(VAULT_PATH);
  }

  // Use environment variable method to avoid credential leakage in logs
  const git = simpleGit(VAULT_PATH, {
    progress: ({ method, stage, progress }) => {
      // Redact any URLs that might appear in progress output
      const safeProgress = progress?.replace(/https:\/\/[^@]+@/, 'https://***@/');
      console.log(`[GIT] ${method} ${stage} ${safeProgress}`);
    },
  });

  // Set environment variables for git credential handling
  // This avoids embedding credentials in URLs or command history
  git.env({
    ...process.env,
    GIT_ASKPASS: '/bin/echo',
    GIT_TERMINAL_PROMPT: '0',
    GIT_USERNAME: username,
    GIT_PASSWORD: token,
  });

  return git;
}

export async function ensureVault() {
  if (!existsSync(VAULT_PATH)) {
    await mkdir(VAULT_PATH, { recursive: true });
  }
}

export async function initVault(repoUrl: string) {
  await ensureVault();

  // Check if it's already a git repo
  const isRepo = existsSync(`${VAULT_PATH}/.git`);

  if (!isRepo) {
    const git = await getGitWithCredentials();
    // Clean URL - remove any existing credentials
    const cleanUrl = repoUrl.replace(/^https:\/\/[^@]+@/, 'https://');
    await git.clone(cleanUrl, VAULT_PATH);
  }
}

export async function syncVault() {
  try {
    // Get repo URL from environment or remote
    let repoUrl = process.env.GIT_REPO_URL;

    if (!repoUrl) {
      // Try to get from existing remote
      const git = simpleGit(VAULT_PATH);
      const remotes = await git.getRemotes(true);
      const origin = remotes.find((r) => r.name === 'origin');
      repoUrl = origin?.refs?.fetch || origin?.refs?.push;
    }

    if (!repoUrl) {
      throw new Error('No git repository URL configured');
    }

    const git = await getGitWithCredentials();

    // Clean URL - remove any existing credentials
    const cleanUrl = repoUrl.replace(/^https:\/\/[^@]+@/, 'https://');
    await git.remote(['set-url', 'origin', cleanUrl]);

    // Fetch and pull - credentials handled by environment variables
    await git.fetch();
    await git.pull('origin', 'main');

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GIT] Sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getLastSync() {
  try {
    const git = simpleGit(VAULT_PATH);
    const log = await git.log({ maxCount: 1 });
    return log.latest?.date || null;
  } catch {
    return null;
  }
}
