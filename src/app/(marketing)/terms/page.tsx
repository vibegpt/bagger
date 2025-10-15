import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
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
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">
            Last Updated: January 15, 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Bagger (&quot;the Service&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Service Description</h2>
            <p className="text-muted-foreground mb-4">
              Bagger is a read-only portfolio tracking tool for cryptocurrency tokens across multiple blockchain
              networks. The Service allows you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Connect wallet addresses to view token holdings</li>
              <li>Track token performance across Pump.fun (Solana) and Zora (Base)</li>
              <li>Log streams and social media posts</li>
              <li>Analyze correlations between activity and token performance</li>
              <li>View portfolio analytics and insights</li>
            </ul>
          </section>

          {/* Important Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Important Disclaimers</h2>
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Read-Only Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Bagger is a READ-ONLY service. We do not and cannot execute transactions,
                    move funds, or access your private keys. All wallet connections are for
                    viewing public blockchain data only.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Not Financial Advice</h3>
                  <p className="text-sm text-muted-foreground">
                    Bagger provides portfolio tracking and analytics tools. Nothing on this Service
                    constitutes financial, investment, legal, or tax advice. You are solely responsible
                    for your investment decisions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Investment Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    We do not recommend specific tokens, trading strategies, or investment opportunities.
                    All insights and analytics are for informational purposes only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold mb-4">User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account with others</li>
              <li>Use the Service in compliance with all applicable laws</li>
              <li>Not attempt to hack, disrupt, or reverse engineer the Service</li>
              <li>Not use the Service for illegal activities</li>
              <li>Verify all data displayed before making financial decisions</li>
            </ul>
          </section>

          {/* Wallet Connections */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Wallet Connections</h2>
            <p className="text-muted-foreground mb-4">
              When connecting a wallet to Bagger:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You only grant us permission to READ public blockchain data</li>
              <li>We NEVER request transaction signing permissions</li>
              <li>We NEVER see or store your private keys or seed phrases</li>
              <li>We cannot move, transfer, or access your funds</li>
              <li>You can disconnect your wallet at any time</li>
              <li>You are responsible for the security of your wallet</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Bagger integrates with third-party wallet providers (Phantom, MetaMask, etc.). Your use
              of those wallets is subject to their respective terms and conditions.
            </p>
          </section>

          {/* Data Accuracy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Data Accuracy</h2>
            <p className="text-muted-foreground">
              We strive to provide accurate data by fetching information from blockchain networks
              and official APIs. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Data may be delayed or temporarily inaccurate</li>
              <li>Third-party APIs may experience downtime or errors</li>
              <li>Blockchain data is only as reliable as the network itself</li>
              <li>Token prices and market data can change rapidly</li>
              <li>You should verify critical information independently</li>
            </ul>
            <p className="text-muted-foreground mt-4 font-semibold">
              Bagger is not liable for losses resulting from inaccurate data or service interruptions.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are owned by Bagger
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground mt-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service without
              explicit permission.
            </p>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold mb-4">User-Generated Content</h2>
            <p className="text-muted-foreground mb-4">
              When you create content on Bagger (stream logs, post tracking, notes):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You retain ownership of your content</li>
              <li>You grant us a license to store and display it as part of the Service</li>
              <li>You are responsible for the accuracy of manually entered data</li>
              <li>You must not upload illegal, offensive, or infringing content</li>
            </ul>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted access.
              The Service may be temporarily unavailable due to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Scheduled maintenance</li>
              <li>Technical issues or outages</li>
              <li>Third-party service disruptions</li>
              <li>Security incidents</li>
              <li>Force majeure events</li>
            </ul>
          </section>

          {/* Free Tier */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Free Tier and Future Paid Services</h2>
            <p className="text-muted-foreground">
              Bagger currently operates on a free tier with no subscription fees. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Introduce paid tiers or premium features in the future</li>
              <li>Modify feature availability between free and paid tiers</li>
              <li>Change pricing with reasonable notice to users</li>
              <li>Discontinue the free tier with adequate transition time</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Existing users will be notified at least 30 days before any changes to service pricing.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violation of these Terms</li>
              <li>Illegal activity or abuse of the Service</li>
              <li>Extended account inactivity</li>
              <li>Security concerns</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You may delete your account at any time through the settings page.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-2">IMPORTANT LEGAL NOTICE</p>
                <p className="text-sm text-muted-foreground">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BAGGER SHALL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
                  REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  This includes but is not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Trading losses or missed opportunities</li>
                  <li>Inaccurate data or service interruptions</li>
                  <li>Unauthorized access to your account</li>
                  <li>Third-party service failures</li>
                  <li>Blockchain network issues</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Bagger and its officers, directors, employees,
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees)
              arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your content or data</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of
              material changes via email or prominent notice on the Service. Continued use of
              the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              Questions about these Terms? Contact us:
            </p>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li><strong>Email:</strong> legal@bagger.app</li>
                  <li><strong>Support:</strong> support@bagger.app</li>
                  <li><strong>Website:</strong> https://bagger.app</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              will be limited or eliminated to the minimum extent necessary so that the Terms will
              otherwise remain in full force and effect.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Entire Agreement</h2>
            <p className="text-muted-foreground">
              These Terms constitute the entire agreement between you and Bagger regarding the use
              of the Service, superseding any prior agreements.
            </p>
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
