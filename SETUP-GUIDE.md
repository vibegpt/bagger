# Creator Analytics - Setup Guide

Complete step-by-step guide to get your development environment running.

## ✅ What We've Done So Far

- ✅ Created Next.js 14 project with TypeScript
- ✅ Installed all dependencies (Prisma, Clerk, Recharts, shadcn/ui)
- ✅ Set up Prisma schema with all tables
- ✅ Created environment variables template
- ✅ Installed shadcn/ui components
- ✅ Created utility libraries (formatting, calculations)
- ✅ Built Whop integration (OAuth + API client + sync logic)
- ✅ Set up TypeScript types

## 🔨 What You Need to Do Next

### Step 1: Set Up PostgreSQL Database (Choose One Option)

#### Option A: Local PostgreSQL (Quickest for Development)

1. Install PostgreSQL:
   ```bash
   # macOS
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt install postgresql
   sudo service postgresql start
   ```

2. Create database:
   ```bash
   createdb creator_analytics
   ```

3. Update `.env`:
   ```
   DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/creator_analytics?schema=public"
   ```

#### Option B: Supabase (Recommended for Production)

1. Go to [database.new](https://database.new)
2. Create new project
3. Copy "Connection string" (Transaction mode)
4. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
   ```

#### Option C: Vercel Postgres

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create new Postgres database
3. Copy connection string
4. Update `.env`

### Step 2: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init
```

You should see: "Your database is now in sync with your schema."

### Step 3: Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and sign up
2. Create new application
3. Go to "API Keys" in dashboard
4. Copy keys to `.env`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

5. Configure redirects in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`

### Step 4: Register Whop App (For OAuth)

1. Go to [whop.com/apps](https://whop.com/apps)
2. Click "Create App"
3. Fill in:
   - Name: "Creator Analytics" (or your app name)
   - Redirect URI: `http://localhost:3000/connect/whop/callback`
   - Scopes:
     - read_products
     - read_memberships
     - read_analytics
     - read_company

4. Copy credentials to `.env`:
   ```
   WHOP_CLIENT_ID=your_client_id
   WHOP_CLIENT_SECRET=your_client_secret
   ```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

You should see the Next.js welcome page.

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution:**
1. Check DATABASE_URL is correct
2. Test connection: `psql $DATABASE_URL`
3. Ensure PostgreSQL is running

### Error: "Environment variable not found"

**Solution:**
1. Copy .env.example to .env: `cp .env.example .env`
2. Fill in all required variables
3. Restart dev server

### Error: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

## 📝 Next Development Steps (Week 1)

Once your dev environment is running:

### Day 1-2: Build Auth Pages
- [ ] Create sign-in page at `src/app/(auth)/sign-in/page.tsx`
- [ ] Create sign-up page at `src/app/(auth)/sign-up/page.tsx`
- [ ] Test authentication flow

### Day 3-4: Build Dashboard Shell
- [ ] Create dashboard layout at `src/app/(dashboard)/layout.tsx`
- [ ] Add navigation sidebar
- [ ] Create empty dashboard page

### Day 5-7: Whop OAuth Flow
- [ ] Create "Connect Whop" button
- [ ] Build OAuth callback handler
- [ ] Test connecting Whop account
- [ ] Trigger first data sync

## 🎯 Milestone Checklist

- [ ] Database connected and migrated
- [ ] Clerk authentication working
- [ ] Dev server running without errors
- [ ] Can sign up / sign in
- [ ] Whop app registered
- [ ] Ready to build features!

## 🆘 Need Help?

Common issues and solutions:

1. **TypeScript errors**: Run `npx prisma generate` to regenerate types
2. **Module not found**: Run `npm install` again
3. **Prisma errors**: Try `npx prisma generate && npx prisma migrate dev`
4. **Clerk errors**: Double-check environment variables

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Whop API Docs](https://dev.whop.com)

---

Ready to start building! 🚀
