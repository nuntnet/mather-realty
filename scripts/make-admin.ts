/**
 * One-time script to give admin role to an existing user.
 * Usage:  bun run scripts/make-admin.ts your@email.com
 */

import { createClient } from '@libsql/client'

const email = process.argv[2]
if (!email) {
  console.error('❌  Usage: bun run scripts/make-admin.ts your@email.com')
  process.exit(1)
}

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('❌  TURSO_DATABASE_URL not set — make sure .env.local is loaded')
  process.exit(1)
}

const client = createClient({ url, authToken })

// Check user exists
const existing = await client.execute({
  sql: 'SELECT id, email, role FROM user WHERE email = ?',
  args: [email],
})

if (existing.rows.length === 0) {
  console.error(`❌  No account found for ${email}`)
  console.error('    → Register first at /register, then run this script again.')
  process.exit(1)
}

const user = existing.rows[0]
console.log(`Found user:  ${user.email}  (current role: ${user.role ?? 'user'})`)

// Update role
await client.execute({
  sql: "UPDATE user SET role = 'admin' WHERE email = ?",
  args: [email],
})

console.log(`✅  Done! ${email} is now admin.`)
console.log('   → Go to /admin to access the dashboard.')

await client.close()
