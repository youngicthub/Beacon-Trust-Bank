#!/usr/bin/env node
// One-time admin seeding script — run with: node scripts/seed-admin.mjs
import bcrypt from "bcryptjs";
import pg from "pg";

const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  const email = "admin@beacontrust.online";
  const firstName = "Admin";
  const lastName = "Beacon";
  const tempPassword = "BeaconAdmin2026!";

  // Check if already exists
  const existing = await client.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    console.log(`Admin user already exists (id: ${existing.rows[0].id})`);
    await client.end();
    return;
  }

  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const result = await client.query(
    `INSERT INTO users (id, email, first_name, last_name, role, is_active, password_hash, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, 'admin', true, $4, NOW(), NOW())
     RETURNING id`,
    [email, firstName, lastName, passwordHash]
  );

  console.log(`✅ Admin user created:`);
  console.log(`   ID:       ${result.rows[0].id}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${tempPassword}`);
  console.log(`   Role:     admin`);
  console.log(`\nChange your password after first login.`);

  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
