import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

migrate(db, { migrationsFolder: './drizzle' }).then(() => {
  console.log('Migrations applied');
  pool.end();
});
