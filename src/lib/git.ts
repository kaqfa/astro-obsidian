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
