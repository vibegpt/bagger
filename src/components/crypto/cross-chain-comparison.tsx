"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, DollarSign, Users, ArrowRight, Zap, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TokenData {
  address: string;
  chain: {
    id: string;
    name: string;
    explorer: string;
  };
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creator: string;
  creatorUsername?: string;
  imageUrl?: string;
  description?: string;
}

export function CrossChainComparison() {
  const [baseAddress, setBaseAddress] = useState("");
  const [solanaAddress, setSolanaAddress] = useState("");
  const [baseToken, setBaseToken] = useState<TokenData | null>(null);
  const [solanaToken, setSolanaToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState({ base: false, solana: false });
  const [error, setError] = useState({ base: "", solana: "" });

  // Format large numbers
  const formatSupply = (supply: string, decimals: number) => {
    const value = BigInt(supply);
    const divisor = BigInt(10 ** decimals);
    const formatted = Number(value / divisor);

    if (formatted >= 1_000_000_000) {
      return `${(formatted / 1_000_000_000).toFixed(2)}B`;
    }
    if (formatted >= 1_000_000) {
      return `${(formatted / 1_000_000).toFixed(2)}M`;
    }
    if (formatted >= 1_000) {
      return `${(formatted / 1_000).toFixed(2)}K`;
    }
    return formatted.toLocaleString();
  };

  // Fetch Base token
  const fetchBaseToken = async () => {
    if (!baseAddress || !/^0x[a-fA-F0-9]{40}$/.test(baseAddress)) {
      setError(prev => ({ ...prev, base: "Invalid Base address format" }));
      return;
    }

    setLoading(prev => ({ ...prev, base: true }));
    setError(prev => ({ ...prev, base: "" }));

    try {
      const response = await fetch(`/api/tokens?address=${baseAddress}`);
      const data = await response.json();

      if (data.success) {
        setBaseToken(data.token);
      } else {
        setError(prev => ({ ...prev, base: data.error || "Failed to fetch token" }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, base: "Network error" }));
    } finally {
      setLoading(prev => ({ ...prev, base: false }));
    }
  };

  // Fetch Solana token
  const fetchSolanaToken = async () => {
    if (!solanaAddress) {
      setError(prev => ({ ...prev, solana: "Please enter a Solana address" }));
      return;
    }

    setLoading(prev => ({ ...prev, solana: true }));
    setError(prev => ({ ...prev, solana: "" }));

    try {
      const response = await fetch(`/api/tokens?address=${solanaAddress}`);
      const data = await response.json();

      if (data.success) {
        setSolanaToken(data.token);
      } else {
        setError(prev => ({ ...prev, solana: data.error || "Failed to fetch token" }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, solana: "Network error" }));
    } finally {
      setLoading(prev => ({ ...prev, solana: false }));
    }
  };

  // Comparison chart data
  const comparisonData = [
    {
      metric: "Supply",
      base: baseToken ? Number(BigInt(baseToken.totalSupply) / BigInt(10 ** baseToken.decimals)) : 0,
      solana: solanaToken ? Number(BigInt(solanaToken.totalSupply) / BigInt(10 ** solanaToken.decimals)) : 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold gradient-text">Cross-Chain Token Comparison</h2>
        <p className="mt-2 text-muted-foreground">
          Compare creator coins across Base (Zora) and Solana (Pump.fun)
        </p>
      </div>

      {/* Input Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Base Input */}
        <Card className="border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <CardTitle>Base (Zora)</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                EVM
              </Badge>
            </div>
            <CardDescription>Enter Zora creator coin contract address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={baseAddress}
                onChange={(e) => setBaseAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={fetchBaseToken}
                disabled={loading.base}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {error.base && (
              <p className="text-sm text-red-500">{error.base}</p>
            )}
            {baseToken && (
              <div className="space-y-2 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{baseToken.name}</span>
                  <Badge variant="outline">${baseToken.symbol}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Supply:</span>
                    <span className="font-mono">{formatSupply(baseToken.totalSupply, baseToken.decimals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decimals:</span>
                    <span className="font-mono">{baseToken.decimals}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solana Input */}
        <Card className="border-green-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <CardTitle>Solana (Pump.fun)</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                SPL
              </Badge>
            </div>
            <CardDescription>Enter Pump.fun token mint address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Token mint address..."
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                onClick={fetchSolanaToken}
                disabled={loading.solana}
                className="bg-green-500 hover:bg-green-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {error.solana && (
              <p className="text-sm text-red-500">{error.solana}</p>
            )}
            {solanaToken && (
              <div className="space-y-2 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{solanaToken.name}</span>
                  <Badge variant="outline">${solanaToken.symbol}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Supply:</span>
                    <span className="font-mono">{formatSupply(solanaToken.totalSupply, solanaToken.decimals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decimals:</span>
                    <span className="font-mono">{solanaToken.decimals}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison View */}
      {baseToken && solanaToken && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
            <CardDescription>
              Comparing {baseToken.symbol} (Base) vs {solanaToken.symbol} (Solana)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Base Token Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{baseToken.name}</h3>
                    <p className="text-sm text-muted-foreground">Base Network</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Symbol</span>
                    <span className="font-semibold">${baseToken.symbol}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-semibold font-mono">{formatSupply(baseToken.totalSupply, baseToken.decimals)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Decimals</span>
                    <span className="font-semibold">{baseToken.decimals}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Token Standard</span>
                    <span className="font-semibold">ERC-20</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`${baseToken.chain.explorer}/token/${baseToken.address}`, '_blank')}
                >
                  View on BaseScan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Solana Token Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{solanaToken.name}</h3>
                    <p className="text-sm text-muted-foreground">Solana Network</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Symbol</span>
                    <span className="font-semibold">${solanaToken.symbol}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-semibold font-mono">{formatSupply(solanaToken.totalSupply, solanaToken.decimals)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Decimals</span>
                    <span className="font-semibold">{solanaToken.decimals}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Token Standard</span>
                    <span className="font-semibold">SPL</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`${solanaToken.chain.explorer}/token/${solanaToken.address}`, '_blank')}
                >
                  View on Solscan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-semibold mb-3">Quick Comparison</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="text-center p-3 rounded bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Supply Difference</p>
                  <p className="text-lg font-bold">
                    {Math.abs(
                      Number(BigInt(baseToken.totalSupply) / BigInt(10 ** baseToken.decimals)) -
                      Number(BigInt(solanaToken.totalSupply) / BigInt(10 ** solanaToken.decimals))
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Decimal Diff</p>
                  <p className="text-lg font-bold">{Math.abs(baseToken.decimals - solanaToken.decimals)}</p>
                </div>
                <div className="text-center p-3 rounded bg-background">
                  <p className="text-xs text-muted-foreground mb-1">Chains</p>
                  <p className="text-lg font-bold">2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Tokens */}
      {!baseToken && !solanaToken && (
        <Card>
          <CardHeader>
            <CardTitle>Try These Examples</CardTitle>
            <CardDescription>Quick start with popular creator coins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  setBaseAddress("0x1111111111166b7fe7bd91427724b487980afc69");
                  setBaseToken(null);
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">$ZORA (Base)</div>
                  <div className="text-xs text-muted-foreground font-mono">0x1111...c69</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  setSolanaAddress("2GXmB95pGD3pHV4mzNq7YsmyiEmVYWQLptbwYqgdpump");
                  setSolanaToken(null);
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">Pump.fun Token (Solana)</div>
                  <div className="text-xs text-muted-foreground font-mono">2GXm...pump</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
