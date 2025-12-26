import { db } from './src/lib/db';
import { userTable } from './src/lib/db/schema';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import { generateId } from 'lucia';
import * as path from 'path';
import * as readline from 'readline';
import { db } from './src/lib/db';
import { userTable } from './src/lib/db/schema';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import { generateId } from 'lucia';
import * as path from 'path';
import * as readline from 'readline';
import { db } from './src/lib/db';
import { userTable } from './src/lib/db/schema';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import { generateId } from 'lucia';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function cloneRepository() {
  const gitRepoUrl = process.env.GIT_REPO_URL;
  const gitUsername = process.env.GIT_USERNAME;
  const gitToken = process.env.GIT_TOKEN;

  if (!gitRepoUrl) {
    console.log('⏩ No GIT_REPO_URL found in .env, skipping repository clone...');
    return;
  }

  try {
    const vaultDir = './vault';

    // Check if vault directory already exists and has content
    if (fs.existsSync(vaultDir) && fs.readdirSync(vaultDir).length > 0) {
      const answer = await question('\n⚠️  Vault directory already exists. Overwrite? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('📂 Using existing vault directory...');
        return;
      }

      // Remove existing vault
      console.log('🗑️  Removing existing vault...');
      fs.rmSync(vaultDir, { recursive: true, force: true });
    }

    console.log('\n📥 Cloning repository...');
    console.log(`   Repository: ${gitRepoUrl}`);

    // Construct authenticated URL
    let cloneUrl = gitRepoUrl;
    if (gitUsername && gitToken) {
      // Parse URL and inject credentials
      const urlObj = new URL(gitRepoUrl);
      urlObj.username = gitUsername;
      urlObj.password = gitToken;
      cloneUrl = urlObj.toString();
    }

    // Clone repository
    execSync(`git clone ${cloneUrl} ${vaultDir}`, {
      stdio: 'inherit',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });

    console.log('✅ Repository cloned successfully!');

    // Remove .git directory to prevent accidental commits
    const gitDir = path.join(vaultDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
      console.log('🔒 Removed .git directory for safety');
    }
  } catch (err: any) {
    console.error('❌ Failed to clone repository!');
    console.error('Error details:', err.message);

    if (err.message?.includes('Authentication')) {
      console.error('\n💡 Hint: Check your GIT_USERNAME and GIT_TOKEN in .env file');
    } else if (err.message?.includes('not found')) {
      console.error('\n💡 Hint: Verify the GIT_REPO_URL is correct');
    }

    throw err;
  }
}

async function createUser() {
  try {
    console.log('👤 Creating admin user...\n');

    const username = await question('Username: ');
    const password = await question('Password: ');

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const userId = generateId(15);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await db.select().from(userTable).where(eq(userTable.username, username));

    if (existingUser.length > 0) {
      throw new Error('User with this username already exists');
    }

    await db.insert(userTable).values({
      id: userId,
      username,
      passwordHash: hashedPassword,
    });

    console.log('\n✅ User created successfully!');
    console.log('You can now login with these credentials.');
  } catch (err: any) {
    console.error('\n❌ Failed to create user!');
    console.error('Error details:', err.message);

    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }

    throw err;
  }
}

async function setup() {
  try {
    console.log('🔧 Obsidian Web Setup\n');
    console.log('='.repeat(50));

    // Step 1: Clone repository
    console.log('\n📦 Step 1: Repository Setup');
    console.log('-'.repeat(50));
    await cloneRepository();

    // Step 2: Create user
    console.log('\n👤 Step 2: User Setup');
    console.log('-'.repeat(50));
    await createUser();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Setup completed successfully!');
    console.log('='.repeat(50));

    rl.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n' + '='.repeat(50));
    console.error('💥 Setup failed!');
    console.error('='.repeat(50));

    rl.close();
    process.exit(1);
  }
}

setup();
