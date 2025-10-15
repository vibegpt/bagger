"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { base } from "wagmi/chains";

interface ZoraWalletConnectProps {
  onConnect?: (address: string) => void;
}

export function ZoraWalletConnect({ onConnect }: ZoraWalletConnectProps) {
  const { address, isConnected, chain } = useAccount();

  useEffect(() => {
    if (isConnected && address && onConnect) {
      onConnect(address);
    } else if (!isConnected && onConnect) {
      onConnect("");
    }
  }, [isConnected, address, onConnect]);

  return (
    <div className="flex flex-col gap-2">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported || chain.id !== base.id) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Wrong network - Switch to Base
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 hover:bg-primary/10 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">
                      {account.displayName}
                    </span>
                  </button>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
      {isConnected && chain?.id !== base.id && (
        <p className="text-xs text-destructive">
          Please switch to Base network to view Zora coins
        </p>
      )}
    </div>
  );
}
