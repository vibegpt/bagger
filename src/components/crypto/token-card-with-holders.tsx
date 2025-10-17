"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ChevronDown, ChevronUp, Users } from "lucide-react";
import { HolderAnalytics } from "./holder-analytics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TokenCardWithHoldersProps {
  token: {
    mint?: string;
    address?: string;
    name: string;
    symbol: string;
    imageUri?: string;
    price: number;
    marketCap: number;
  };
  holding: {
    balance: number;
    valueUsd: number;
  };
  platform: "pumpfun" | "zora";
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

export function TokenCardWithHolders({
  token,
  holding,
  platform,
  formatCurrency,
  formatNumber,
}: TokenCardWithHoldersProps) {
  const [showHolders, setShowHolders] = useState(false);
  const isUnknownToken = token.symbol === "UNKNOWN";

  return (
    <Card className="cyber-border">
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          {token.imageUri ? (
            <img
              src={token.imageUri}
              alt={token.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <Badge
            variant="secondary"
            className={isUnknownToken ? "bg-yellow-500/20 text-yellow-500" : "bg-accent/20 text-accent"}
          >
            {isUnknownToken ? "Graduated" : "Holding"}
          </Badge>
        </div>
        <CardTitle className="text-base line-clamp-1">{token.name}</CardTitle>
        <CardDescription className="text-xs">
          {isUnknownToken ? (
            <span className="font-mono text-[10px]">{(token.mint || token.address)?.slice(0, 16)}...</span>
          ) : (
            `$${token.symbol}`
          )}
        </CardDescription>
        {isUnknownToken && (
          <p className="text-[10px] text-muted-foreground mt-1">
            May have graduated to Raydium
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-semibold">{formatNumber(holding.balance)}</span>
          </div>
          {token.price > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(holding.valueUsd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">
                  {formatCurrency(token.price)}
                </span>
              </div>
            </>
          )}
          {!isUnknownToken && token.marketCap > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-semibold">
                {formatCurrency(token.marketCap)}
              </span>
            </div>
          )}
        </div>

        {/* Holder Analytics Toggle - Only for Pump.fun tokens with data */}
        {platform === "pumpfun" && !isUnknownToken && token.mint && (
          <Collapsible open={showHolders} onOpenChange={setShowHolders}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full" size="sm">
                <Users className="h-4 w-4 mr-2" />
                {showHolders ? "Hide" : "View"} Holder Analytics
                {showHolders ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <HolderAnalytics
                tokenMint={token.mint}
                tokenName={token.name}
                platform="pumpfun"
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
