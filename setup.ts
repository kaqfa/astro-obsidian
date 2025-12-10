import Database from 'better-sqlite3';
import { generateId } from 'lucia';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  const db = new Database('auth.db');

  db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
  )`);

  const username = await question('Username: ');
  const password = await question('Password: ');

  const userId = generateId(15);
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.prepare('INSERT INTO user (id, username, password_hash) VALUES (?, ?, ?)')
    .run(userId, username, hashedPassword);

  console.log('\n✅ User created successfully!');
  console.log('You can now login with these credentials.');
  
  rl.close();
  process.exit(0);
}

setup();
