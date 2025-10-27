'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialMetricsCard } from '@/components/social-metrics-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';

interface TokenDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: {
    mint: string;
    name: string;
    symbol: string;
    imageUri?: string;
    marketCap: number;
    price: number;
    volume24h: number;
    priceChange24h?: number;
    holderCount: number;
    chain: 'base' | 'solana';
    platform: 'zora' | 'pumpfun';
  };
}

export function TokenDetailDialog({ open, onOpenChange, token }: TokenDetailDialogProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const isPositive = (token.priceChange24h || 0) >= 0;
  const chainColor = token.chain === 'base' ? 'blue' : 'green';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {token.imageUri ? (
              <img
                src={token.imageUri}
                alt={token.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-${chainColor}-500/20 to-${chainColor}-600/20 flex items-center justify-center`}>
                {token.chain === 'base' ? (
                  <Zap className={`h-8 w-8 text-${chainColor}-500`} />
                ) : (
                  <Activity className={`h-8 w-8 text-${chainColor}-500`} />
                )}
              </div>
            )}
            <div>
              <DialogTitle className="text-2xl">{token.name}</DialogTitle>
              <DialogDescription className="text-base">
                ${token.symbol}
                <Badge
                  variant="secondary"
                  className={`ml-2 ${token.chain === 'base' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}
                >
                  {token.platform === 'zora' ? 'Zora' : 'Pump.fun'}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="social">Social Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(token.price)}</div>
                  {token.priceChange24h !== undefined && token.priceChange24h !== 0 && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}% (24h)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Market Cap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(token.marketCap)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    24h Volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(token.volume24h)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Trading activity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Holders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(token.holderCount)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total holders</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <SocialMetricsCard mintAddress={token.mint} tokenSymbol={token.symbol} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
