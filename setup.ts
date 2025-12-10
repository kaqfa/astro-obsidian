import { generateId } from 'lucia';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import { db } from './src/lib/db';
import { userTable } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  // Create tables (Turso will auto-create from schema)
  console.log('🔧 Setting up database...\n');

  const username = await question('Username: ');
  const password = await question('Password: ');

  const userId = generateId(15);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Check if user already exists
  const existingUser = await db.select().from(userTable).where(eq(userTable.username, username));
  
  if (existingUser.length > 0) {
    console.log('\n❌ User with this username already exists!');
    rl.close();
    process.exit(1);
  }

  await db.insert(userTable).values({
    id: userId,
    username,
    passwordHash: hashedPassword
  });

  console.log('\n✅ User created successfully!');
  console.log('You can now login with these credentials.');
  
  rl.close();
  process.exit(0);
}

setup();
