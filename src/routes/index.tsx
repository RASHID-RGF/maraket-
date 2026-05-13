import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { MarketCard } from "@/components/MarketCard";
import { LivePulse } from "@/components/LivePulse";
import { Ticker } from "@/components/Ticker";
import { MARKETS, formatKES } from "@/lib/markets";
import { Activity, Globe2, TrendingUp, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseMarket — Realtime global prediction markets" },
      {
        name: "description",
        content:
          "Place bets on real-world events as they unfold. Watch a live worldwide pulse of predictions across politics, crypto, sports, and pop culture.",
      },
      { property: "og:title", content: "PulseMarket — Realtime global prediction markets" },
      {
        property: "og:description",
        content:
          "Realtime predictions across the world. Trade Yes/No on the events that move politics, finance, sports, and culture.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !loading && !!user;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/auth' });
    }
  }, [isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full gradient-yes glow-yes">
            <TrendingUp className="w-7 h-7 text-yes-foreground animate-spin" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Loading PulseMarket...</h2>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(
    () => (category === "All" ? MARKETS : MARKETS.filter((m) => m.category === category)),
    [category]
  );

  const totalVol = MARKETS.reduce((s, m) => s + m.volume, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <Ticker />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        {/* Hero */}
        <section className="relative mb-10 md:mb-14">
          {/* Decorative orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, var(--yes) 0%, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, var(--no) 0%, transparent 70%)" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-xs mb-5">
                <Globe2 className="h-3.5 w-3.5 text-yes" />
                <span className="text-foreground/90">
                  Live across <span className="text-yes font-semibold">142 countries</span>
                </span>
                <span className="mx-1 h-1 w-1 rounded-full bg-border" />
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yes opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-yes" />
                </span>
                <span className="text-muted-foreground">streaming now</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                The world is{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-yes via-yes to-[oklch(0.78_0.16_180)] bg-clip-text text-transparent">
                    predicting
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full opacity-60"
                    style={{ background: "var(--gradient-yes)" }}
                  />
                </span>
                .
                <br />
                Place your bet.
              </h1>

              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                A realtime prediction market for everything that happens next. Buy{" "}
                <span className="text-yes font-semibold">Yes</span> or{" "}
                <span className="text-no font-semibold">No</span> on politics, crypto,
                sports, and culture — alongside traders from every continent.
              </p>

              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat icon={Activity} label="24h Volume" value={formatKES(totalVol)} />
                <Stat icon={Users} label="Traders" value="184K" accent />
                <Stat icon={TrendingUp} label="Markets" value={`${MARKETS.length}`} />
                <Stat icon={Zap} label="Bets / min" value="2,841" accent />
              </div>
            </div>

            <div className="lg:pl-4">
              <LivePulse />
            </div>
          </div>
        </section>

        <div className="mb-6">
          <CategoryNav active={category} onChange={setCategory} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Trending now</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                The hottest markets of the past 24 hours
              </p>
            </div>
            <span className="text-xs text-muted-foreground num">
              {filtered.length} markets
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          PulseMarket · Demo prediction market · Not financial advice
        </footer>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass rounded-xl px-3.5 py-3 transition-colors ${
        accent ? "hover:border-yes/40" : "hover:border-border"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className={`h-3 w-3 ${accent ? "text-yes" : ""}`} />
        {label}
      </div>
      <div
        className={`mt-1 text-lg md:text-xl font-bold num ${accent ? "text-yes" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

