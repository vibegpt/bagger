import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-bold gradient-text">Bagger</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Last Updated: January 15, 2025
          </p>
        </div>

        {/* Security Highlights */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-500" />
                <CardTitle className="text-sm">Read-Only Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                We only read public blockchain data. We never request signing permissions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-sm">No Private Keys</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                We never see, store, or have access to your private keys or seed phrases.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm">Minimal Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                We only store your email and wallet addresses you choose to connect.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Policy Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              Bagger (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
            <Card className="border-primary/20 bg-primary/5 mt-4">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Key Privacy Commitment</p>
                    <p className="text-sm text-muted-foreground">
                      Bagger is a read-only portfolio tracker. We NEVER request transaction signing permissions,
                      access to your private keys, or ability to move your funds. All wallet connections are
                      purely for reading public blockchain data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3">1. Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Email address (for account creation and authentication)</li>
              <li>Username or display name (optional)</li>
              <li>Authentication data managed by Clerk</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2. Wallet Addresses</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Public wallet addresses you choose to connect (Solana and Base/EVM)</li>
              <li>These are PUBLIC addresses already visible on the blockchain</li>
              <li>We store these to remember your connected wallets between sessions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3. Blockchain Data (Read-Only)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Token balances and holdings (publicly available on-chain)</li>
              <li>Token metadata (names, symbols, images)</li>
              <li>Transaction history (publicly visible on blockchain explorers)</li>
              <li>Market data (prices, volumes, holder counts)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4. User-Generated Content</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Stream logs you manually create</li>
              <li>Social media post tracking data you enter</li>
              <li>Notes and custom metadata you add</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5. Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pages visited and features used</li>
              <li>Browser type and device information</li>
              <li>IP address and general location</li>
              <li>Session duration and interaction patterns</li>
            </ul>
          </section>

          {/* What We DO NOT Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4">What We DO NOT Collect or Store</h2>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <UserCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Private Keys or Seed Phrases</p>
                      <p className="text-sm text-muted-foreground">We never see or have access to your wallet&apos;s private keys</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <UserCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Transaction Signing Permissions</p>
                      <p className="text-sm text-muted-foreground">We only request read access, never write/sign permissions</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <UserCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Ability to Move Your Funds</p>
                      <p className="text-sm text-muted-foreground">Our service cannot initiate transactions or move tokens</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <UserCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Private Transaction Details</p>
                      <p className="text-sm text-muted-foreground">We only display publicly available blockchain data</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and maintain our portfolio tracking service</li>
              <li>To display your token balances and portfolio analytics</li>
              <li>To remember your connected wallets between sessions</li>
              <li>To calculate performance metrics and insights</li>
              <li>To send service updates and important notifications (optional)</li>
              <li>To improve our service and develop new features</li>
              <li>To detect and prevent technical issues</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>All data transmitted using HTTPS encryption</li>
              <li>Database hosted on secure infrastructure (Supabase)</li>
              <li>Authentication managed by Clerk with industry-standard security</li>
              <li>Regular security updates and monitoring</li>
              <li>Access controls and audit logging</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Sharing and Third Parties</h2>
            <p className="text-muted-foreground mb-4">
              We work with the following third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Clerk</strong> - Authentication and user management</li>
              <li><strong>Supabase</strong> - Database hosting</li>
              <li><strong>Vercel</strong> - Application hosting and delivery</li>
              <li><strong>Zora SDK</strong> - Fetching public Zora blockchain data</li>
              <li><strong>Pump.fun API</strong> - Fetching public Solana token data</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do NOT sell your personal information to third parties. We only share data with
              service providers necessary to operate our platform.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Disconnect wallets at any time</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at privacy@bagger.app or use the settings
              page within your account.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your personal information is deleted within 30 days</li>
              <li>Aggregated, anonymized analytics may be retained</li>
              <li>Blockchain data remains public on the blockchain (not controlled by us)</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Bagger is not intended for users under 18 years of age. We do not knowingly collect
              information from children. If you believe we have collected information from a child,
              please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold mb-4">International Users</h2>
            <p className="text-muted-foreground">
              Bagger is operated from the United States. If you are accessing our service from outside
              the US, please be aware that your information may be transferred to, stored, and processed
              in the US where our servers are located.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li><strong>Email:</strong> privacy@bagger.app</li>
                  <li><strong>Support:</strong> support@bagger.app</li>
                  <li><strong>Website:</strong> https://bagger.app</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button size="lg">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
