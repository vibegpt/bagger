"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void;
}

export function WalletConnectButton({ onConnect }: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<Array<{name: string, provider: any}>>([]);

  const detectWallets = () => {
    const wallets: Array<{name: string, provider: any}> = [];

    // Try to find MetaMask specifically first (it might be hidden by Rainbow)
    // MetaMask sometimes injects as window.ethereum.providers[0] even when Rainbow overrides
    if (typeof window !== "undefined") {
      // Check for direct MetaMask injection
      if ((window as any).ethereum?.providers) {
        // Multiple wallets - look through all providers
        (window as any).ethereum.providers.forEach((provider: any) => {
          if (provider.isMetaMask && !provider.isRainbow) {
            wallets.push({ name: "MetaMask", provider });
          }
          if (provider.isRainbow) {
            wallets.push({ name: "Rainbow", provider });
          }
          if (provider.isCoinbaseWallet) {
            wallets.push({ name: "Coinbase", provider });
          }
        });
      } else if ((window as any).ethereum) {
        // Single provider - add it
        const provider = (window as any).ethereum;
        if (provider.isMetaMask && !provider.isRainbow) {
          wallets.push({ name: "MetaMask", provider });
        } else if (provider.isRainbow) {
          wallets.push({ name: "Rainbow", provider });
        } else if (provider.isCoinbaseWallet) {
          wallets.push({ name: "Coinbase", provider });
        } else {
          wallets.push({ name: "Browser Wallet", provider });
        }
      }
    }

    console.log("Detected wallets:", wallets.map(w => w.name));
    setAvailableWallets(wallets);
    return wallets;
  };

  const handleConnect = async (provider?: any) => {
    setIsConnecting(true);
    toast.loading("Connecting wallet...", { id: "wallet" });

    try {
      // Check if any Ethereum wallet is installed
      if (typeof window.ethereum === "undefined") {
        toast.error("Please install MetaMask or another Ethereum wallet", { id: "wallet" });
        return;
      }

      // Use provided provider or detect wallets
      let selectedProvider = provider;

      if (!selectedProvider) {
        const wallets = detectWallets();

        // If multiple wallets, show selection (this shouldn't happen anymore with dropdown)
        if (wallets.length > 1) {
          toast.dismiss("wallet");
          return; // User should select from dropdown
        }

        selectedProvider = wallets[0]?.provider || window.ethereum;
      }

      // Request account access
      const accounts = await selectedProvider.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      setConnectedAddress(address);

      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, {
        id: "wallet",
      });

      if (onConnect) {
        onConnect(address);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet", { id: "wallet" });
    } finally {
      setIsConnecting(false);
    }
  };

  // Detect wallets on mount
  useEffect(() => {
    detectWallets();
  }, []);

  if (connectedAddress) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">
          {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
        </span>
      </div>
    );
  }

  const hasMetaMask = availableWallets.some(w => w.name === "MetaMask");

  // If only one wallet and it's detected, connect directly
  if (availableWallets.length === 1 && !isConnecting) {
    return (
      <Button
        onClick={() => handleConnect(availableWallets[0].provider)}
        disabled={isConnecting}
        className="glow-primary"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : `Connect ${availableWallets[0].name}`}
      </Button>
    );
  }

  // Show dropdown for multiple wallets or no wallets detected
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isConnecting} className="glow-primary">
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableWallets.length === 0 && (
          <DropdownMenuItem disabled>
            No wallet detected
          </DropdownMenuItem>
        )}
        {availableWallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.name}
            onClick={() => handleConnect(wallet.provider)}
          >
            {wallet.name}
          </DropdownMenuItem>
        ))}
        {!hasMetaMask && (
          <DropdownMenuItem
            onClick={() => {
              toast.info("Please disable Rainbow wallet in your browser extensions, then refresh this page to use MetaMask", {
                duration: 8000,
              });
            }}
          >
            Can't find MetaMask? Click here
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
