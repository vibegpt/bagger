"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserButton } from "@clerk/nextjs";
import { Wallet } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your Bagger account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account and authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12"
                }
              }}
            />
            <div>
              <p className="text-sm font-medium">Account Settings</p>
              <p className="text-xs text-muted-foreground">
                Click your avatar to manage your account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Wallet Connections</CardTitle>
              <CardDescription className="mt-1">
                Wallets are connected per session for privacy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your MetaMask (Zora) and Phantom (Pump.fun) wallets from the Portfolio page to view your bags.
            Wallet connections are session-based and won't be stored permanently.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Bagger</CardTitle>
          <CardDescription>
            Web3 creator coins analytics platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Track your bags across Zora (Base) and Pump.fun (Solana)</p>
            <p className="text-xs">Version 0.1.0 - MVP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
