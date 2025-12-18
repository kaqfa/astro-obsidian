import simpleGit from 'simple-git';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

const VAULT_PATH = './vault';
const git = simpleGit(VAULT_PATH);

function getAuthenticatedUrl(repoUrl: string): string {
  const username = process.env.GIT_USERNAME;
  const token = process.env.GIT_TOKEN;

  if (!username || !token) {
    return repoUrl;
  }

  try {
    // Clean "https://" from the URL if it exists
    const cleanUrl = repoUrl.replace(/^https:\/\//, '');
    return `https://${username}:${token}@${cleanUrl}`;
  } catch (e) {
    console.error('Error constructing authenticated URL:', e);
    return repoUrl;
  }
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
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');
      repoUrl = origin?.refs?.fetch || origin?.refs?.push;
    }
    
    if (!repoUrl) {
      throw new Error('No git repository URL configured');
    }
    
    // Set authenticated remote URL
    const authUrl = getAuthenticatedUrl(repoUrl);
    await git.remote(['set-url', 'origin', authUrl]);
    
    // Now fetch and pull with credentials
    await git.fetch();
    await git.pull('origin', 'main');
    
    return { 
      success: true, 
      timestamp: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Sync failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getLastSync() {
  try {
    const log = await git.log({ maxCount: 1 });
    return log.latest?.date || null;
  } catch {
    return null;
  }
}
