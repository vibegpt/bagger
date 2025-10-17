"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Download, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareToTwitterButtonProps {
  cardType: 'early-ape' | 'raydium-watch' | 'bag-status' | 'alpha-alert' | 'whale-watch';
  params: Record<string, string>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareToTwitterButton({
  cardType,
  params,
  variant = "outline",
  size = "default"
}: ShareToTwitterButtonProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Build share card URL with all params
  const queryParams = new URLSearchParams({
    type: cardType,
    ...params,
  });
  const shareCardUrl = `/api/pumpfun-card?${queryParams.toString()}`;

  // Generate degen-friendly captions based on card type
  const getCaptions = () => {
    switch (cardType) {
      case 'early-ape':
        return [
          `Early to $${params.tokenTicker || 'TOKEN'}, already up ${params.pnlPercent || '0'}%! 🦍\n\nFound it on @Bagger\n\nTrack your apes: bagger.tools`,
          `Aped into $${params.tokenTicker || 'TOKEN'} ${params.timeAgo || '1h'} ago\n${params.pnlPercent || '0'}% gains and counting 🚀\n\nUsing @Bagger to track my bags\nbagger.tools`,
          `NGMI if you're not tracking your apes 🦍\n\n$${params.tokenTicker || 'TOKEN'}: ${params.pnlPercent || '0'}%\n\n@Bagger keeping me disciplined\nbagger.tools`,
        ];
      case 'raydium-watch':
        return [
          `🚨 $${params.tokenTicker || 'TOKEN'} is ${params.raydiumPercent || '0'}% to Raydium graduation!\n\nTracking on @Bagger\nbagger.tools`,
          `Raydium watch activated 👀\n\n$${params.tokenTicker || 'TOKEN'}\n${params.raydiumPercent || '0'}% to graduation\n${params.holderCount || '0'} holders\n\n@Bagger has the data\nbagger.tools`,
          `This is about to pop off 🚀\n\n$${params.tokenTicker || 'TOKEN'} almost at Raydium (${params.raydiumPercent || '0'}%)\n\nGet alerts: bagger.tools`,
        ];
      case 'bag-status':
        return [
          `My Pump.fun bags are cooking 🔥\n\nTotal P&L: ${params.totalPnl || '0'}%\n\nTop performer: $${params.topToken1 || 'TOKEN'} (+${params.topPnl1 || '0'}%)\n\nTrack yours on @Bagger\nbagger.tools`,
          `Portfolio update 💰\n\n${params.totalPnl || '0'}% across all bags\n\nLFG! 🚀\n\n@Bagger keeping me organized\nbagger.tools`,
          `Degen portfolio looking good 👀\n\n$${params.topToken1 || 'TOKEN'}: +${params.topPnl1 || '0'}%\n$${params.topToken2 || 'TOKEN'}: +${params.topPnl2 || '0'}%\n$${params.topToken3 || 'TOKEN'}: +${params.topPnl3 || '0'}%\n\nUsing @Bagger\nbagger.tools`,
        ];
      case 'alpha-alert':
        return [
          `🔔 NEW ALPHA 🔔\n\n$${params.tokenTicker || 'TOKEN'}\nJust launched ${params.createdAgo || '1m'} ago\n${params.marketCap || '0'} MC\n\nFound on @Bagger\nbagger.tools`,
          `Early bird gets the worm 🐦\n\n$${params.tokenTicker || 'TOKEN'}\nFresh launch, ${params.initialLiquidity || '0'} liquidity\n\n@Bagger alpha alerts hitting different\nbagger.tools`,
          `DYOR but this looks interesting 👀\n\n$${params.tokenTicker || 'TOKEN'}\nCreated ${params.createdAgo || '1m'} ago\nStill early\n\nUsing @Bagger for discovery\nbagger.tools`,
        ];
      case 'whale-watch':
        return [
          `🐋 WHALE ALERT 🐋\n\n$${params.tokenTicker || 'TOKEN'}\n${params.whaleAction || 'BUY'}: $${params.whaleAmount || '0'}\n${params.whalePercent || '0'}% of supply\n\nTracking on @Bagger\nbagger.tools`,
          `Big moves happening 👀\n\nWhale just ${params.whaleAction === 'BUY' ? 'aped' : 'dumped'} $${params.whaleAmount || '0'} on $${params.tokenTicker || 'TOKEN'}\n\nPrice impact: ${params.priceImpact || '0'}%\n\n@Bagger whale alerts\nbagger.tools`,
          `Follow the whales 🐋\n\n$${params.tokenTicker || 'TOKEN'}\n${params.whaleAction || 'BUY'}: ${params.whalePercent || '0'}% of supply\n\n${params.whaleAction === 'BUY' ? 'Bullish signal' : 'Bearish signal'}\n\nbagger.tools`,
        ];
      default:
        return [`Check out my Pump.fun stats on @Bagger\n\nbagger.tools`];
    }
  };

  const captions = getCaptions();
  const [selectedCaption, setSelectedCaption] = useState(captions[0]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(shareCardUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bagger-${cardType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Card downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download card');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(selectedCaption);
      setCopied(true);
      toast.success('Caption copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy caption');
    }
  };

  const handleShareTwitter = () => {
    // Open Twitter with the caption (user will need to upload image manually)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedCaption)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share to X
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share to X (Twitter)</DialogTitle>
          <DialogDescription>
            Download your card and share it with the degen community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Preview */}
          <div className="relative overflow-hidden rounded-lg border-2 border-primary/20">
            <img
              src={shareCardUrl}
              alt="Share card preview"
              className="w-full h-auto"
            />
          </div>

          {/* Step 1: Download Card */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <h4 className="font-semibold">Download Your Card</h4>
            </div>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download Card'}
            </Button>
          </div>

          {/* Step 2: Choose and Copy Caption */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <h4 className="font-semibold">Choose Your Caption</h4>
            </div>
            <div className="space-y-2">
              {captions.map((caption, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCaption === caption
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCaption(caption)}
                >
                  <p className="text-sm whitespace-pre-line">{caption}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleCopyCaption}
              variant="outline"
              className="w-full gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Selected Caption
                </>
              )}
            </Button>
          </div>

          {/* Step 3: Share on Twitter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <h4 className="font-semibold">Post on X</h4>
            </div>
            <Button
              onClick={handleShareTwitter}
              className="w-full gap-2 bg-black hover:bg-black/90 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Open X (Twitter)
            </Button>
            <p className="text-xs text-muted-foreground">
              Manually upload the downloaded image with your caption on X
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
