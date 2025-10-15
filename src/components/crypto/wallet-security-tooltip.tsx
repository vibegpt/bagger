"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

export function WalletSecurityTooltip() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 hover:bg-green-500/20 transition-colors"
            aria-label="Wallet security information"
          >
            <Lock className="h-3 w-3 text-green-500" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-sm p-4 border-green-500/20 bg-green-500/5"
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Your Wallet is Safe
            </h4>
            <p className="text-xs text-muted-foreground">
              Bagger is <strong>read-only</strong>. When you connect:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 pl-2">
              <li>✓ We only view your public address & balances</li>
              <li>✓ We <strong>never</strong> request signing permissions</li>
              <li>✓ We <strong>cannot</strong> move or access your funds</li>
              <li>✓ We <strong>never</strong> see private keys</li>
              <li>✓ All blockchain data is already public</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              <a href="/privacy" target="_blank" className="text-green-500 hover:underline">
                Learn more →
              </a>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
