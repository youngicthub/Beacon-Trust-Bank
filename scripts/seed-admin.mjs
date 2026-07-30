#!/usr/bin/env node
// Seeds the default admin account — safe to re-run (upserts on email).
// Credentials: admin@beacontrust.com / Admin@12345
import bcrypt from "bcryptjs";
import pg from "pg";

const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  const email = "admin@beacontrust.com";
  const firstName = "Admin";
  const lastName = "User";
  const password = "Admin@12345";

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await client.query(
    `INSERT INTO users (email, first_name, last_name, role, is_active, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, 'admin', true, $4, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET
       role = 'admin',
       is_active = true,
       password_hash = EXCLUDED.password_hash,
       updated_at = NOW()
     RETURNING id, email, role`,
    [email, firstName, lastName, passwordHash]
  );

  const row = result.rows[0];
  console.log(`✅ Admin account ready:`);
  console.log(`   ID:       ${row.id}`);
  console.log(`   Email:    ${row.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${row.role}`);

  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
