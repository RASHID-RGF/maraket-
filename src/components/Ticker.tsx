import { MARKETS } from "@/lib/markets";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Ticker() {
  const items = [...MARKETS, ...MARKETS];
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface/40 backdrop-blur-md">
      <div className="flex gap-8 py-2.5 animate-[ticker_55s_linear_infinite] whitespace-nowrap">
        {items.map((m, i) => {
          const up = m.change24h >= 0;
          return (
            <div key={`${m.id}-${i}`} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{m.image}</span>
              <span className="font-medium truncate max-w-[280px]">{m.question}</span>
              <span className="num text-yes font-semibold">
                {Math.round(m.yesPrice * 100)}¢
              </span>
              <span
                className={`inline-flex items-center gap-0.5 num font-medium ${
                  up ? "text-yes" : "text-no"
                }`}
              >
                {up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {up ? "+" : ""}
                {(m.change24h * 100).toFixed(1)}%
              </span>
              <span className="text-muted-foreground/60">•</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
