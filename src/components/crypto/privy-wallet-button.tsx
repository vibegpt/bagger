"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

interface PrivyWalletButtonProps {
  onConnect?: (address: string) => void;
}

export function PrivyWalletButton({ onConnect }: PrivyWalletButtonProps) {
  const { login, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  // Get the embedded wallet address
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
  const address = embeddedWallet?.address;

  // Call onConnect when we have an address
  useEffect(() => {
    if (address && onConnect) {
      onConnect(address);
    }
  }, [address, onConnect]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Error connecting with Privy:", error);
    }
  };

  if (!ready) {
    return (
      <Button disabled className="glow-primary">
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (authenticated && address) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} className="glow-primary">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Zora Wallet
    </Button>
  );
}
