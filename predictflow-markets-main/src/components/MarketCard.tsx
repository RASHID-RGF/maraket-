import { Link } from "@tanstack/react-router";
import type { Market } from "@/lib/markets";
import { formatKES } from "@/lib/markets";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export function MarketCard({ market }: { market: Market }) {
  const pct = Math.round(market.yesPrice * 100);
  const up = market.change24h >= 0;
  const sparkColor = up ? "var(--yes)" : "var(--no)";

  return (
    <Link
      to="/market/$marketId"
      params={{ marketId: market.id }}
      className="group glass rounded-2xl p-5 flex flex-col gap-4 transition-all hover:border-border hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-2xl">
          {market.image}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {market.category}
          </div>
          <h3 className="mt-0.5 text-[15px] font-semibold leading-snug line-clamp-2 group-hover:text-yes transition-colors">
            {market.question}
          </h3>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold num text-yes">{pct}</span>
            <span className="text-sm font-medium text-yes/80">%</span>
            <span className="text-xs text-muted-foreground">YES</span>
          </div>
          <div
            className={`mt-1 inline-flex items-center gap-1 text-xs font-medium num ${
              up ? "text-yes" : "text-no"
            }`}
          >
            {up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {up ? "+" : ""}
            {(market.change24h * 100).toFixed(1)}%
          </div>
        </div>
        <div className="h-12 w-24 -mr-1 min-h-[48px]">
          <ResponsiveContainer width={100} height={48}>
            <AreaChart data={market.history.slice(-30)} width={100} height={48}>
              <defs>
                <linearGradient id={`spark-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="p"
                stroke={sparkColor}
                strokeWidth={2}
                fill={`url(#spark-${market.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="num">Vol {formatKES(market.volume)}</span>
        <div className="flex gap-2">
          <span className="rounded-md bg-yes/10 px-2 py-0.5 text-yes font-semibold num">
            Yes {pct}¢
          </span>
          <span className="rounded-md bg-no/10 px-2 py-0.5 text-no font-semibold num">
            No {100 - pct}¢
          </span>
        </div>
      </div>
    </Link>
  );
}
