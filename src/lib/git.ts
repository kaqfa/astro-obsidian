import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import simpleGit from 'simple-git';

const VAULT_PATH = './vault';

/**
 * Get authenticated git URL from environment variables
 * Embeds credentials securely for HTTP authentication
 */
function getAuthenticatedUrl(repoUrl: string): string {
  const username = process.env.GIT_USERNAME;
  const token = process.env.GIT_TOKEN;

  if (!username || !token) {
    return repoUrl;
  }

  // Remove existing credentials if any, then add fresh ones
  const cleanUrl = repoUrl.replace(/^https:\/\/[^@]+@/, 'https://');
  return cleanUrl.replace('https://', `https://${username}:${token}@`);
}

/**
 * Get git instance with progress logging
 */
async function getGitInstance() {
  return simpleGit(VAULT_PATH, {
    progress: ({ method, stage, progress }) => {
      // Redact credentials in progress output
      const progressStr = String(progress ?? '');
      const safeProgress = progressStr.replace(/https:\/\/[^:]+:[^@]+@/, 'https://***@/');
      if (safeProgress) {
        console.log(`[GIT] ${method} ${stage} ${safeProgress}`);
      }
    },
  });
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
    const git = await getGitInstance();
    const authUrl = getAuthenticatedUrl(repoUrl);
    await git.clone(authUrl, VAULT_PATH);
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

    const git = await getGitInstance();

    // Set remote URL with embedded credentials
    const authUrl = getAuthenticatedUrl(repoUrl);
    await git.remote(['set-url', 'origin', authUrl]);

    // Fetch and pull
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
