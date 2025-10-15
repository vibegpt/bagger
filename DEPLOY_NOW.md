# 🚀 Deploy Bagger Now - Step-by-Step Guide

Follow these exact steps to deploy Bagger to production.

## ✅ Prerequisites (Already Done)
- [x] Supabase account created
- [x] Clerk account created
- [x] Vercel account created
- [x] Code is ready to deploy

## 📝 Your Supabase Connection Strings

You provided:
```
Direct Connection:
postgresql://postgres:[YOUR-PASSWORD]@db.raivxeewtxgwqyilxiun.supabase.co:5432/postgres

Transaction Pooler (USE THIS FOR VERCEL):
postgres://postgres:[YOUR-PASSWORD]@db.raivxeewtxgwqyilxiun.supabase.co:6543/postgres
```

**IMPORTANT:** For Vercel, use the **Transaction Pooler** (port 6543)

---

## Step 1: Get Your Clerk Production Keys

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your Bagger application
3. Click **API Keys** in the left sidebar
4. Copy your **Production** keys (not Test keys):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)
5. Save these somewhere safe - you'll need them in Step 4

---

## Step 2: Push Code to GitHub

```bash
# Make sure you're in the project directory
cd /Users/toddbyrne/creator-analytics

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment - Bagger v0.1.0"

# Create a new repository on GitHub
# Go to: https://github.com/new
# Repository name: bagger
# Make it private or public (your choice)
# Don't initialize with README (we already have one)

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bagger.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3A. Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `bagger` repository from GitHub
4. Click **Import**

### 3B. Configure Project

- **Project Name:** `bagger` (or your preferred name)
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./`
- **Build Command:** `npm run build` (default is fine)
- **Output Directory:** `.next` (default is fine)

### 3C. DON'T DEPLOY YET!

Click **Environment Variables** (expand the section) before deploying.

---

## Step 4: Add Environment Variables in Vercel

Add these environment variables in Vercel (one by one):

### Database
```
Name: DATABASE_URL
Value: postgres://postgres:YOUR_SUPABASE_PASSWORD@db.raivxeewtxgwqyilxiun.supabase.co:6543/postgres
```
**Replace `YOUR_SUPABASE_PASSWORD` with your actual password!**

### Clerk Authentication
```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: pk_live_xxx (your actual production key from Step 1)
```

```
Name: CLERK_SECRET_KEY
Value: sk_live_xxx (your actual production secret from Step 1)
```

```
Name: NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /sign-in
```

```
Name: NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /sign-up
```

```
Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
Value: /crypto
```

```
Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
Value: /crypto
```

### App URL (temporary - we'll update this)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://bagger.vercel.app
```
(You'll update this with your actual domain after deployment)

---

## Step 5: Deploy!

1. After adding all environment variables, click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Vercel will give you a URL like: `https://bagger-xxx.vercel.app`
4. Copy this URL!

---

## Step 6: Run Database Migrations

Your database needs the schema. Choose ONE method:

### Method A: Using Supabase SQL Editor (Easiest)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy the SQL from each migration file in order:
   - `/Users/toddbyrne/creator-analytics/prisma/migrations/*/migration.sql`
6. Run each migration
7. Verify tables were created in **Table Editor**

### Method B: Using Prisma CLI (If you have migrations locally)

```bash
# Set the production database URL
export DATABASE_URL="postgres://postgres:YOUR_PASSWORD@db.raivxeewtxgwqyilxiun.supabase.co:6543/postgres"

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

## Step 7: Update Clerk Configuration

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your Bagger application
3. Go to **Paths** in the left sidebar
4. Update these settings with your Vercel domain:

**Home URL:**
```
https://bagger-xxx.vercel.app
```

**Sign-in URL:**
```
https://bagger-xxx.vercel.app/sign-in
```

**Sign-up URL:**
```
https://bagger-xxx.vercel.app/sign-up
```

**After sign-in:**
```
https://bagger-xxx.vercel.app/crypto
```

**After sign-up:**
```
https://bagger-xxx.vercel.app/crypto
```

5. Go to **Domains** tab
6. Add your Vercel domain to **Allowed origins**:
   ```
   https://bagger-xxx.vercel.app
   ```

---

## Step 8: Update NEXT_PUBLIC_APP_URL

1. Go back to Vercel
2. Navigate to: **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_APP_URL`
4. Click **Edit**
5. Update to your actual Vercel URL:
   ```
   https://bagger-xxx.vercel.app
   ```
6. Click **Save**
7. Go to **Deployments** tab
8. Click **Redeploy** on the latest deployment
9. Select **Use existing Build Cache**
10. Click **Redeploy**

---

## Step 9: Test Your Deployment 🎉

Visit your Vercel URL: `https://bagger-xxx.vercel.app`

### Test Checklist:

1. **Landing Page**
   - [ ] Page loads without errors
   - [ ] Security badge shows "🔒 Read-Only • No Private Keys"
   - [ ] Footer links work (Privacy, Terms)

2. **Authentication**
   - [ ] Click "Get Started" or "Sign Up"
   - [ ] Sign up with email works
   - [ ] Sign in works
   - [ ] Sign out works
   - [ ] Redirects to `/crypto` after sign in

3. **Privacy Pages**
   - [ ] `/privacy` loads correctly
   - [ ] `/terms` loads correctly
   - [ ] All information is accurate

4. **Crypto Page**
   - [ ] Security notice shows before wallet connection
   - [ ] Can see wallet connection buttons
   - [ ] Try connecting a wallet (optional)

5. **Other Features**
   - [ ] `/streams` page loads
   - [ ] `/engagement` page loads
   - [ ] `/analytics` page loads
   - [ ] `/settings` page loads

---

## 🎯 Post-Deployment (Optional but Recommended)

### 1. Add Custom Domain (Optional)

If you have a custom domain:

1. In Vercel: **Settings** → **Domains**
2. Add your domain (e.g., `bagger.app`)
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Clerk allowed origins to your custom domain

### 2. Set Up Monitoring

- Enable Vercel Analytics in dashboard
- Consider adding Sentry for error tracking
- Set up uptime monitoring (e.g., UptimeRobot)

### 3. Create First User

- Sign up with your own account
- Test all features
- Connect test wallets
- Log test streams and posts

---

## 🐛 Troubleshooting

### Build Fails

**Error:** TypeScript or ESLint errors
**Solution:** Already handled in `next.config.ts`

### Database Connection Error

**Error:** "Can't connect to database"
**Solution:**
1. Verify `DATABASE_URL` in Vercel environment variables
2. Make sure you used the **Transaction Pooler** URL (port 6543)
3. Check password is correct (no special characters issues)
4. Ensure database isn't paused in Supabase

### Clerk Errors

**Error:** Redirect loops or "Unauthorized"
**Solution:**
1. Verify all Clerk environment variables are set correctly
2. Check redirect URLs match exactly (including https://)
3. Make sure domain is in Clerk allowed origins
4. Use **production** keys (`pk_live_...`), not test keys

### Wallet Connection Not Working

**Error:** Wallet won't connect
**Solution:**
1. Check browser console for errors
2. Ensure HTTPS is enabled (Vercel does this automatically)
3. Try different browser or wallet
4. Clear browser cache

### Pages Not Found (404)

**Error:** Routes return 404
**Solution:**
1. Clear Vercel build cache and redeploy
2. Check all files are committed to GitHub
3. Verify build completed successfully

---

## 📊 Success Metrics

After deployment, you should see:

✅ **Vercel Dashboard:**
- Build status: Success
- Function region: Auto
- Analytics enabled

✅ **Supabase Dashboard:**
- Tables created (User, StreamSession, SocialPost, etc.)
- Connection count > 0

✅ **Clerk Dashboard:**
- Allowed origins configured
- Production keys active
- User count starting to grow

---

## 🎉 You're Live!

Once everything is tested and working:

1. Share your URL on Twitter
2. Add to your bio
3. Tell your Web3 creator friends
4. Start tracking your bags!

**Your Bagger deployment is complete!** 🚀

---

## 💡 Next Steps (Future)

- Add custom domain
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Add more features
- Launch paid tiers
- Grow user base

**Questions?** Check:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `PRIVACY_AND_SECURITY.md` - Privacy implementation details

---

**Built with ❤️ for Web3 creators**

Track Your Bags. Secure Your Bags. 💰
