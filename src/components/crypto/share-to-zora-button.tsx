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
import { Share2, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareToZoraButtonProps {
  totalValue: string;
  tokenCount: number;
  topToken?: string;
  topTokenValue?: string;
  holderCount?: number;
  userName?: string;
}

export function ShareToZoraButton({
  totalValue,
  tokenCount,
  topToken = "N/A",
  topTokenValue = "$0",
  holderCount = 0,
  userName = "My",
}: ShareToZoraButtonProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareCardUrl = `/api/share-card?type=portfolio&totalValue=${encodeURIComponent(
    totalValue
  )}&tokenCount=${tokenCount}&topToken=${encodeURIComponent(
    topToken
  )}&topTokenValue=${encodeURIComponent(
    topTokenValue
  )}&holderCount=${holderCount}&userName=${encodeURIComponent(userName)}`;

  const caption = `Just checked my Web3 creator portfolio on @bagger 📊

💎 Total Value: ${totalValue}
🪙 Tracking ${tokenCount} tokens
👥 ${holderCount} total holders

Top performer: ${topToken} (${topTokenValue})

Data-driven creators win. Track your portfolio at bagger.tools`;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(shareCardUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bagger-portfolio-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Analytics card downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download card");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      toast.success("Caption copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy caption");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share to Zora
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Your Analytics on Zora</DialogTitle>
          <DialogDescription>
            Download your analytics card and post it on Zora to showcase your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="rounded-lg overflow-hidden border">
            <img
              src={shareCardUrl}
              alt="Analytics card preview"
              className="w-full h-auto"
            />
          </div>

          {/* Download Button */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Step 1: Download your analytics card</h4>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Downloading..." : "Download Image"}
            </Button>
          </div>

          {/* Copy Caption */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Step 2: Copy caption for your post</h4>
            <div className="relative">
              <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono">
                {caption}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 gap-2"
                onClick={handleCopyCaption}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Step 3: Post on Zora</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to zora.co and sign in</li>
              <li>Click "Create Post"</li>
              <li>Upload the downloaded image</li>
              <li>Paste the caption</li>
              <li>Publish your post</li>
            </ol>
            <p className="text-xs mt-4">
              Your post will automatically become a tradeable content coin on Zora!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
