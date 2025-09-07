import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';

const sqlite = new Database('./database.sqlite');
export const db = drizzle(sqlite, { schema });

export async function initializeDatabase() {
  try {
    migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

export * from './schema';