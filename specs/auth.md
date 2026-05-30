# Authentication

## Overview

ใช้ **Better Auth 1.5** กับ SQLite database บน **Turso** — email/password only, ไม่มี OAuth provider

```
User login (email + password)
        │
        ▼
POST /api/auth/sign-in/email
        │
        ▼
Better Auth validates → creates session in Turso
        │
        ▼
Set cookie: better-auth.session_token (dev)
           __Secure-better-auth.session_token (prod HTTPS)
        │
        ▼
Browser ส่ง cookie ทุก request → middleware validate
```

## Configuration (`lib/auth.ts`)

```typescript
betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),  // Turso
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  plugins: [admin()],  // เปิด role-based admin
  trustedOrigins: ["http://localhost:3002", process.env.BETTER_AUTH_URL],
})
```

**Graceful degradation:** ถ้า `TURSO_DATABASE_URL` ไม่ถูกตั้ง — `auth` จะเป็น `null` และ API ส่งกลับ 503

## Admin Protection (`middleware.ts`)

Middleware intercept ทุก request ที่ไป `/admin/*`:

1. ตรวจ cookie `better-auth.session_token` หรือ `__Secure-better-auth.session_token`
2. ถ้าไม่มี → redirect `/login?callbackUrl=/admin/...`
3. เรียก `GET /api/auth/get-session` validate token
4. ถ้า session invalid → redirect `/login?callbackUrl=...`
5. ตรวจ `session.user.role === "admin"`
6. ถ้าไม่ใช่ admin → redirect `/login?error=unauthorized`
7. ผ่าน → render admin page

## Database Schema (Turso/SQLite)

Better Auth จัดการ schema อัตโนมัติ ประกอบด้วย:

| Table | คำอธิบาย |
|-------|----------|
| `user` | id, name, email, emailVerified, image, createdAt, updatedAt, role |
| `session` | id, expiresAt, ipAddress, userAgent, userId |
| `account` | id, accountId, providerId, userId, accessToken, etc. |
| `verification` | id, identifier, value, expiresAt |

**Admin role** เก็บใน `user.role` — better-auth admin plugin จัดการ

## สร้าง Admin Account

หลัง deploy ครั้งแรก ต้องสร้าง admin user ผ่าน Better Auth API:

```bash
# 1. สมัคร account ปกติ (ผ่านหน้า /login ของเว็บ หรือ curl)
curl -X POST https://ch-erawan.com/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ch-erawan.com","password":"your-password","name":"Admin"}'

# 2. Set role เป็น admin ผ่าน Better Auth admin API
# (ต้องทำจาก server หรือ script ที่มี BETTER_AUTH_SECRET)
```

หรือ update ตรงใน Turso:
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'admin@ch-erawan.com';
```

## Client-side Auth (`lib/auth-client.ts`)

```typescript
import { authClient } from "@/lib/auth-client"

// Login
await authClient.signIn.email({ email, password })

// Logout
await authClient.signOut()

// Get session
const { data: session } = authClient.useSession()
```

## Security Notes

- Session cookie: httpOnly, secure (prod), sameSite=lax
- Password minimum: 8 characters
- Sessions expire: ดู better-auth default (7 วัน)
- ⚠️ **ยังไม่มี rate limiting** บน `/api/auth/*` — ดู [todo.md](todo.md)
- ⚠️ **ยังไม่มี email verification** — สมัครแล้วใช้ได้เลย
