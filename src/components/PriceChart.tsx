import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "ALL", days: 9999 },
];

export function PriceChart({ data }: { data: { t: number; p: number }[] }) {
  const [range, setRange] = useState("1M");
  const days = RANGES.find((r) => r.label === range)?.days ?? 30;
  const sliced = data.slice(-Math.min(days, data.length));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Probability
          </div>
          <div className="text-2xl font-bold num text-yes">
            {Math.round(sliced[sliced.length - 1].p * 100)}%
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.label)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                range === r.label
                  ? "bg-yes/20 text-yes"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sliced} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--yes)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--yes)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(t) =>
                new Date(t).toLocaleDateString("en", { month: "short", day: "numeric" })
              }
              stroke="oklch(0.6 0.02 250)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              stroke="oklch(0.6 0.02 250)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.22 0.025 254 / 95%)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: 12,
                backdropFilter: "blur(12px)",
                fontSize: 12,
              }}
              labelFormatter={(t) => new Date(t).toLocaleDateString()}
              formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Yes"]}
            />
            <Area
              type="monotone"
              dataKey="p"
              stroke="var(--yes)"
              strokeWidth={2.5}
              fill="url(#chartFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
