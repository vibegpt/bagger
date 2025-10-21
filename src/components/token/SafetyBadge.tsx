"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { TokenSafetyReport } from "@/lib/integrations/analytics/token-safety";
import { getRatingDisplay, getCheckIcon } from "@/lib/integrations/analytics/token-safety";

interface SafetyBadgeProps {
  report: TokenSafetyReport;
  compact?: boolean;
}

/**
 * Compact safety badge similar to BSCScan
 * Shows overall rating with expandable details
 */
export function SafetyBadge({ report, compact = false }: SafetyBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const display = getRatingDisplay(report.overallRating);

  if (compact) {
    // Inline badge for leaderboard
    return (
      <div className="relative inline-block">
        <Badge
          variant="outline"
          className={`${display.bgColor} ${display.color} border cursor-pointer hover:opacity-80 transition-opacity text-xs`}
          onClick={() => setShowDetails(!showDetails)}
        >
          {display.emoji} {report.score}/100
        </Badge>

        {showDetails && (
          <Card className="absolute top-full left-0 mt-2 z-50 w-64 shadow-lg">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Safety Checks</span>
                <span className={`text-xs font-bold ${display.color}`}>
                  {display.label}
                </span>
              </div>

              {report.checks.map((check) => (
                <div key={check.id} className="flex items-start gap-2 text-xs">
                  <span className={
                    check.status === 'pass' ? 'text-green-600' :
                    check.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {getCheckIcon(check.status)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{check.label}</div>
                    <div className="text-muted-foreground">{check.value}</div>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t text-xs text-muted-foreground">
                Updated {report.lastUpdated.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full display for token detail pages
  return (
    <Card className={`${display.bgColor} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{display.emoji}</span>
            <div>
              <div className={`font-bold ${display.color}`}>{display.label}</div>
              <div className="text-sm text-muted-foreground">
                Safety Score: {report.score}/100
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Objective metrics
          </div>
        </div>

        <div className="space-y-3">
          {report.checks.map((check) => (
            <div
              key={check.id}
              className={`flex items-center gap-3 p-2 rounded ${
                check.status === 'pass' ? 'bg-green-50' :
                check.status === 'warning' ? 'bg-yellow-50' :
                'bg-red-50'
              }`}
            >
              <span className={`text-lg ${
                check.status === 'pass' ? 'text-green-600' :
                check.status === 'warning' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {getCheckIcon(check.status)}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">{check.label}</div>
                <div className="text-xs text-muted-foreground">{check.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            These are objective on-chain metrics. Always DYOR (Do Your Own Research).
          </p>
          <p className="mt-1">Last updated: {report.lastUpdated.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Legend component explaining the rating system
 */
export function SafetyLegend() {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Safety Rating Guide
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
              ✓ 80-100
            </Badge>
            <span className="text-muted-foreground">Low Risk - Good distribution & metrics</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
              ⚠ 60-79
            </Badge>
            <span className="text-muted-foreground">Medium Risk - Some concerns present</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              ⚠ 40-59
            </Badge>
            <span className="text-muted-foreground">High Risk - Multiple red flags</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
              ⛔ 0-39
            </Badge>
            <span className="text-muted-foreground">Critical Risk - Major concerns</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p className="font-medium mb-1">What we check:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Token holder concentration</li>
            <li>Developer wallet activity</li>
            <li>Launch fairness patterns</li>
            <li>Liquidity depth</li>
            <li>Creator track record</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
