# Creator Analytics - Quick Start Checklist

## ⚡ Get Running in 15 Minutes

### Prerequisites
- [ ] Node.js 18+ installed (`node -v`)
- [ ] PostgreSQL running OR Supabase account
- [ ] Clerk account (sign up at clerk.com)

---

## Step 1: Database (5 min)

### Option A: Supabase (Recommended)
1. Go to [database.new](https://database.new)
2. Create project (takes 2 min)
3. Copy connection string from Settings → Database
4. Paste into `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres"
   ```

### Option B: Local PostgreSQL
```bash
createdb creator_analytics
# Update .env with: DATABASE_URL="postgresql://YOUR_USER@localhost:5432/creator_analytics"
```

---

## Step 2: Clerk Auth (3 min)

1. Go to [clerk.com](https://clerk.com)
2. Create application
3. Copy keys from API Keys page to `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

---

## Step 3: Whop App (5 min)

1. Go to [whop.com/apps](https://whop.com/apps)
2. Create app:
   - Redirect URI: `http://localhost:3000/connect/whop/callback`
   - Scopes: read_products, read_memberships, read_analytics, read_company
3. Copy to `.env`:
   ```
   WHOP_CLIENT_ID=...
   WHOP_CLIENT_SECRET=...
   ```

---

## Step 4: Run Setup (2 min)

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Run migrations
npx prisma migrate dev --name init

# 3. Start dev server
npm run dev
```

---

## ✅ Checklist

- [ ] `.env` file has DATABASE_URL
- [ ] `.env` file has Clerk keys
- [ ] `.env` file has Whop credentials
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma migrate dev`
- [ ] Server running at http://localhost:3000
- [ ] No errors in terminal

---

## 🎉 You're Ready!

If server is running without errors, you're all set to start building!

**Next:** Read [SETUP-GUIDE.md](./SETUP-GUIDE.md) for next development steps.

---

## 🐛 Issues?

**"Can't connect to database"**
→ Check DATABASE_URL, ensure PostgreSQL is running

**"Clerk keys not found"**
→ Copy from Clerk dashboard, restart server

**"Prisma errors"**
→ Run `npx prisma generate` again

**Still stuck?**
→ Check [SETUP-GUIDE.md](./SETUP-GUIDE.md) troubleshooting section
