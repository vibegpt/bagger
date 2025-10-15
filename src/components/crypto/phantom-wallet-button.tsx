"use client";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface PhantomWalletButtonProps {
  onConnect?: (publicKey: string) => void;
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      publicKey?: { toString(): string };
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
    };
  }
}

export function PhantomWalletButton({ onConnect }: PhantomWalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedPublicKey, setConnectedPublicKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected
    if (window.solana?.publicKey) {
      const publicKey = window.solana.publicKey.toString();
      setConnectedPublicKey(publicKey);
      if (onConnect) {
        onConnect(publicKey);
      }
    }

    // Listen for account changes
    const handleAccountChanged = () => {
      if (window.solana?.publicKey) {
        const publicKey = window.solana.publicKey.toString();
        setConnectedPublicKey(publicKey);
        if (onConnect) {
          onConnect(publicKey);
        }
      } else {
        setConnectedPublicKey(null);
      }
    };

    window.solana?.on("accountChanged", handleAccountChanged);

    return () => {
      window.solana?.off("accountChanged", handleAccountChanged);
    };
  }, [onConnect]);

  const handleConnect = async () => {
    setIsConnecting(true);
    toast.loading("Connecting Phantom wallet...", { id: "phantom-wallet" });

    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        toast.error("Please install Phantom wallet to connect", { id: "phantom-wallet" });
        window.open("https://phantom.app/", "_blank");
        return;
      }

      // Request connection
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      setConnectedPublicKey(publicKey);

      toast.success(`Connected: ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`, {
        id: "phantom-wallet",
      });

      if (onConnect) {
        onConnect(publicKey);
      }
    } catch (error) {
      console.error("Phantom connection error:", error);
      toast.error("Failed to connect Phantom wallet", { id: "phantom-wallet" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setConnectedPublicKey(null);
        toast.success("Phantom wallet disconnected", { id: "phantom-wallet" });
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  if (connectedPublicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 flex-1">
          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-sm font-medium">
            {connectedPublicKey.slice(0, 4)}...{connectedPublicKey.slice(-4)}
          </span>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant="outline"
      className="border-accent/20 hover:bg-accent/5"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Phantom"}
    </Button>
  );
}
