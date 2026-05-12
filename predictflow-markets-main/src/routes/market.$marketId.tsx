import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Clock, Droplets, BarChart3 } from "lucide-react";
import { Header } from "@/components/Header";
import { PriceChart } from "@/components/PriceChart";
import { OrderBook } from "@/components/OrderBook";
import { TradePanel } from "@/components/TradePanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getMarket, formatKES } from "@/lib/markets";

export const Route = createFileRoute("/market/$marketId")({
  loader: ({ params }) => {
    const market = getMarket(params.marketId);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.market.question} · PulseMarket` },
          {
            name: "description",
            content: `Currently ${Math.round(loaderData.market.yesPrice * 100)}% YES. Volume ${formatKES(loaderData.market.volume)}. Trade now on PulseMarket.`,
          },
          { property: "og:title", content: loaderData.market.question },
          {
            property: "og:description",
            content: `${Math.round(loaderData.market.yesPrice * 100)}% YES · Vol ${formatKES(loaderData.market.volume)}`,
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Market not found</h1>
        <Link to="/" className="mt-4 inline-block text-yes underline">
          Back to markets
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-no">{error.message}</p>
    </div>
  ),
  component: MarketDetail,
});

function MarketDetail() {
  const { market } = Route.useLoaderData();
  const up = market.change24h >= 0;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen pb-32 md:pb-12">
      <Header />

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          All markets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-3xl">
                  {market.image}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-yes">
                    {market.category}
                  </div>
                  <h1 className="mt-1 text-xl md:text-2xl font-bold leading-snug">
                    {market.question}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <Meta icon={BarChart3} label="Volume" value={formatKES(market.volume)} />
                    <Meta icon={Droplets} label="Liquidity" value={formatKES(market.liquidity)} />
                    <Meta icon={Clock} label="Ends" value={market.endsAt} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl md:text-4xl font-bold num text-yes leading-none">
                    {Math.round(market.yesPrice * 100)}%
                  </div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold num ${
                      up ? "text-yes" : "text-no"
                    }`}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {up ? "+" : ""}
                    {(market.change24h * 100).toFixed(1)}% 24h
                  </div>
                </div>
              </div>
            </div>

            <PriceChart data={market.history} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OrderBook yesPrice={market.yesPrice} />
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">About this market</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This market resolves YES if the event described in the question occurs
                  before the resolution date ({market.endsAt}). Resolution is determined
                  by official sources and verified by the PulseMarket oracle network.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Field label="Resolution" value="Oracle-verified" />
                  <Field label="Fees" value="2% on win" />
                  <Field label="Status" value="Active" accent />
                  <Field label="Created" value="3 mo ago" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop trade panel */}
          <aside className="hidden lg:block">
            <TradePanel market={market} />
          </aside>
        </div>
      </main>

      {/* Mobile bottom-sheet trade button */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden p-3 glass-strong border-t border-border/60">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <div className="grid grid-cols-2 gap-2">
            <SheetTrigger asChild>
              <Button className="h-12 gradient-yes text-yes-foreground font-bold glow-yes">
                Buy Yes · {Math.round(market.yesPrice * 100)}¢
              </Button>
            </SheetTrigger>
            <SheetTrigger asChild>
              <Button className="h-12 gradient-no text-no-foreground font-bold glow-no">
                Buy No · {Math.round((1 - market.yesPrice) * 100)}¢
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent
            side="bottom"
            className="bg-transparent border-0 p-3 max-h-[92vh] overflow-y-auto"
          >
            <TradePanel market={market} compact />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 num">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-foreground/80 font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface/60 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className={`text-sm font-semibold ${accent ? "text-yes" : ""}`}>{value}</div>
    </div>
  );
}
