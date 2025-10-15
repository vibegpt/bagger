# Bagger - Track Your Bags

The first multi-platform crypto portfolio tracker built for Web3 creators launching tokens on Pump.fun and Zora.

![Bagger](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 What is Bagger?

Bagger helps crypto creators track their bags across multiple chains and platforms. Whether you're launching memecoins on Pump.fun (Solana) or Creator Coins on Zora (Base), Bagger gives you a unified dashboard to monitor your portfolio, correlate streams with token performance, and optimize your social media engagement.

### Built For

- Token creators on Pump.fun and Zora
- Web3 content creators and streamers
- Crypto influencers managing multiple tokens
- Anyone tracking bags across Solana and Base

## ✨ Features

### 🪙 Multi-Chain Portfolio Tracking

**Pump.fun (Solana)**
- Track all tokens you've created
- Monitor holdings across your wallet
- Portfolio aggregation with charts
- Multi-token comparison dashboard
- Graduation tracking and success rates

**Zora (Base)**
- Creator Coin performance
- Content Coin holdings
- Trading fee earnings
- Market cap and volume tracking

### 📊 Stream Analytics

- Manual stream logging (YouTube, Twitch, Kick, etc.)
- Token correlation analysis
- Before/during/after stream snapshots
- Performance impact metrics
- Best performing streams dashboard

### 📱 Social Engagement Tracking

- Log posts across platforms (Twitter, Discord, Telegram, Instagram, TikTok, YouTube)
- Track engagement metrics (likes, comments, shares, views)
- **Best time to post analysis** - hourly and daily charts
- Top performing posts
- Engagement rate calculations

### 📈 Advanced Analytics

- Portfolio value over time
- Token performance comparison
- Stream-to-token correlation
- Social engagement insights
- Automated metrics calculation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (free tier on Supabase)
- Clerk account (free tier)
- Phantom wallet (for Solana)
- Privy/compatible wallet (for Base)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bagger.git
cd bagger
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database (Get from Supabase)
DATABASE_URL="postgresql://..."

# Clerk Authentication (Get from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/crypto
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/crypto

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Set up database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) View database
npx prisma studio
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (from Supabase)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/crypto`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/crypto`
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app`

4. Deploy!

### Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings → Database
3. Use "Connection Pooling" URL for production
4. Add to Vercel environment variables

### Authentication Setup (Clerk)

1. Create application at [clerk.com](https://clerk.com)
2. Configure sign-in options (Email, Google, Wallet)
3. Set redirect URLs:
   - Sign-in: `https://yourdomain.com/sign-in`
   - Sign-up: `https://yourdomain.com/sign-up`
   - After sign-in: `https://yourdomain.com/crypto`
4. Copy API keys to environment variables

## 🏗️ Tech Stack

- **Framework**: Next.js 15.5 (App Router + Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Authentication**: Clerk
- **Wallet**: Privy (Base), Phantom (Solana)
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Blockchain**: Zora SDK, Pump.fun API

## 📁 Project Structure

```
bagger/
├── prisma/
│   ├── schema.prisma           # Database models
│   └── migrations/             # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── crypto/        # Portfolio tracking
│   │   │   ├── streams/       # Stream analytics
│   │   │   ├── engagement/    # Social engagement
│   │   │   ├── analytics/     # Advanced analytics
│   │   │   └── settings/      # User settings
│   │   ├── (marketing)/       # Landing page
│   │   └── api/               # API routes
│   │       ├── zora/          # Zora integration
│   │       ├── pumpfun/       # Pump.fun integration
│   │       ├── streams/       # Stream APIs
│   │       └── posts/         # Social post APIs
│   ├── components/
│   │   ├── crypto/            # Portfolio components
│   │   ├── streams/           # Stream components
│   │   ├── engagement/        # Social components
│   │   ├── dashboard/         # Layout components
│   │   └── ui/                # shadcn/ui primitives
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── zora/             # Zora SDK client
│   │   └── utils.ts          # Utilities
│   └── hooks/
│       ├── use-zora-stats.ts
│       ├── use-pumpfun-stats.ts
│       └── use-portfolio-trends.ts
└── public/
```

## 🗄️ Database Schema

### Core Models

- **User** - User accounts (linked to Clerk)
- **StreamSession** - Stream logs and metrics
- **TokenSnapshot** - Before/after stream token data
- **SocialPost** - Social media post tracking
- **PostTokenSnapshot** - Token performance around posts

### Features

- Automatic timestamps (createdAt, updatedAt)
- Cascade deletes for data integrity
- Indexed fields for performance
- Support for both Solana (mint) and EVM (address) tokens

## 🔌 Blockchain Integrations

### Zora (Base - EVM)

- Uses official Zora SDK
- Fetches Creator Coins and Content Coins
- Real-time market data
- Holder counts and trading volume
- Free API with no rate limits

### Pump.fun (Solana)

- Public API integration
- Token creation tracking
- Holder analysis
- Market cap and volume
- Graduation detection
- Free API access

## 💰 Pricing

### Free Tier (MVP)
- ✅ Unlimited token tracking
- ✅ Manual stream logging
- ✅ Social post tracking
- ✅ Best time to post analysis
- ✅ Portfolio analytics
- ✅ Token correlation
- **Cost: $0/month**

### Pro Tier (Coming Soon)
- All Free features
- Twitter API integration via twitterapi.io
- Automatic post import
- Advanced analytics
- Email reports
- **Cost: $29/month**

### Enterprise (Coming Soon)
- All Pro features
- Direct Twitter API access
- Custom integrations
- Priority support
- Dedicated account manager
- **Cost: Custom pricing**

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Verify DATABASE_URL is correct
npx prisma migrate status

# Reset if needed
npx prisma migrate reset
```

### Wallet Connection Issues

**Phantom (Solana):**
- Install Phantom browser extension
- Ensure you're on mainnet
- Refresh page after installation

**Privy (Base):**
- Works with MetaMask, Coinbase Wallet, Rainbow
- Switch network to Base Mainnet
- Approve connection in wallet

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Try build again
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Zora](https://zora.co) for the Creator Coins SDK
- [Pump.fun](https://pump.fun) for public API access
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Clerk](https://clerk.com) for authentication
- [Supabase](https://supabase.com) for database hosting

## 📞 Support

- Documentation: [Coming Soon]
- Twitter: [@baggerapp](https://twitter.com/baggerapp)
- Email: support@bagger.app

---

**Built with ❤️ for Web3 creators**

Track Your Bags. Secure Your Bags. 💰
