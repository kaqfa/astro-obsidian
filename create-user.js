const { generateId } = require('lucia');
const bcrypt = require('bcrypt');
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { userTable } = require('./src/lib/db/schema.js');
const { eq } = require('drizzle-orm');
require('dotenv').config();

// Create database connection
const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`Connecting to database: ${url}`);

const client = createClient({ url, authToken });
const db = drizzle(client);

async function createUser() {
  try {
    console.log('Creating admin user...\n');

    // Simple hardcoded user for testing
    const username = 'admin';
    const password = 'admin123';

    const userId = generateId(15);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await db.select().from(userTable).where(eq(userTable.username, username));

    if (existingUser.length > 0) {
      console.log('User already exists, updating password...');
      await db
        .update(userTable)
        .set({ passwordHash: hashedPassword })
        .where(eq(userTable.username, username));
    } else {
      await db.insert(userTable).values({
        id: userId,
        username,
        passwordHash: hashedPassword,
      });
    }

    console.log('\n✅ User created/updated successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('You can now login with these credentials.');
  } catch (err) {
    console.error('\n❌ Failed to create user!');
    console.error('Error details:', err.message);

    if (err.stack) {
      console.error('\nStack trace:');
      console.error(err.stack);
    }

    process.exit(1);
  }
}

createUser().then(() => process.exit(0));
