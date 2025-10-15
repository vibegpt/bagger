"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ZoraAddressInputProps {
  onConnect?: (address: string) => void;
}

export function ZoraAddressInput({ onConnect }: ZoraAddressInputProps) {
  const [address, setAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error("Please enter a Zora wallet address");
      return;
    }

    // Basic validation for Ethereum address (0x followed by 40 hex characters)
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address.trim());

    if (!isValidAddress) {
      toast.error("Please enter a valid Ethereum address (0x...)");
      return;
    }

    const trimmedAddress = address.trim();
    setConnectedAddress(trimmedAddress);
    toast.success(`Connected: ${trimmedAddress.slice(0, 6)}...${trimmedAddress.slice(-4)}`);

    if (onConnect) {
      onConnect(trimmedAddress);
    }
  };

  if (connectedAddress) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">
          {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
        </span>
        <button
          onClick={() => {
            setConnectedAddress(null);
            setAddress("");
            if (onConnect) onConnect("");
          }}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <Input
        type="text"
        placeholder="Enter your Zora wallet address (0x...)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" className="glow-primary">
        <Search className="mr-2 h-4 w-4" />
        Connect
      </Button>
    </form>
  );
}
