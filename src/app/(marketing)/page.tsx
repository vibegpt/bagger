import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, BarChart3, Video, MessageSquare, CheckCircle2, ArrowRight, Coins, Users, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary glow-primary">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Bagger</h1>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
            🔒 Read-Only • No Private Keys
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
            Track Pump.fun & Zora
          </Badge>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          The First Multi-Platform
          <br />
          <span className="gradient-text">Crypto Portfolio Tracker</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Built for Web3 creators launching tokens on Pump.fun (Solana) and Zora (Base).
          Track unlimited bags, correlate streams with token performance, and discover your best posting times.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8 glow-primary">
              Start Tracking Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              See Features
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          100% Free • No Credit Card Required • Unlimited Tokens
        </p>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="text-center border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold gradient-text">2</CardTitle>
              <CardDescription>Blockchain Networks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Solana & Base</p>
            </CardContent>
          </Card>
          <Card className="text-center border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold gradient-text">∞</CardTitle>
              <CardDescription>Unlimited Tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track as many as you create</p>
            </CardContent>
          </Card>
          <Card className="text-center border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-500">$0</CardTitle>
              <CardDescription>Forever Free</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">MVP is 100% free</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Features</Badge>
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Track Your Bags</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for Web3 creators managing multiple tokens across chains
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Multi-Chain Portfolio</CardTitle>
              <CardDescription>
                Track all your tokens across Pump.fun (Solana) and Zora (Base) in one unified dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited token tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Real-time market data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Portfolio aggregation
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Compare tokens side-by-side with powerful visualization tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Token comparison charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Graduation tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <Video className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Stream Correlation</CardTitle>
              <CardDescription>
                See how your streams impact token performance with before/after analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Stream logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Token snapshots
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Impact metrics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Social Engagement</CardTitle>
              <CardDescription>
                Track posts across platforms and discover your best posting times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Multi-platform tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Best time to post
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Engagement analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                Get automated insights about your best and worst performing tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Top performers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Success rates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Market trends
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Holder Analytics</CardTitle>
              <CardDescription>
                Track holder counts and growth across all your tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Holder tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Growth metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Community size
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Your Wallets</h3>
            <p className="text-muted-foreground">
              Link your Phantom wallet (Solana) and Base wallet to start tracking
            </p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">View Your Portfolio</h3>
            <p className="text-muted-foreground">
              See all your tokens, market caps, and performance in one dashboard
            </p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Track & Optimize</h3>
            <p className="text-muted-foreground">
              Log streams and posts to see what drives your token performance
            </p>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Platforms</Badge>
          <h2 className="text-4xl font-bold mb-4">Supported Platforms</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your bags across the most popular creator platforms
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Pump.fun (Solana)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track tokens you've created and your holdings across the Solana ecosystem
              </p>
              <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                Live
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Zora (Base)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor Creator Coins and Content Coins on Base with real-time data
              </p>
              <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                Live
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold mb-4">
              Ready to Track Your Bags?
            </CardTitle>
            <CardDescription className="text-lg">
              Join Web3 creators managing their token portfolios with Bagger
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-12 glow-primary">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Free forever
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary glow-primary">
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </div>
                <h3 className="font-bold gradient-text">Bagger</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Track Your Bags. Secure Your Bags.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground">Get Started</Link></li>
                <li><Link href="/crypto" className="hover:text-foreground">Portfolio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/yourusername/bagger" className="hover:text-foreground">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Bagger. Built with ❤️ for Web3 creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
