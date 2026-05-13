interface Level {
  price: number;
  size: number;
}

function makeBook(mid: number, side: "yes" | "no") {
  const levels: Level[] = [];
  for (let i = 0; i < 7; i++) {
    const drift = (i + 1) * 0.01 + Math.random() * 0.005;
    const price = side === "yes" ? mid - drift : mid + drift;
    levels.push({
      price: Math.max(0.01, Math.min(0.99, price)),
      size: Math.round(2000 + Math.random() * 8000),
    });
  }
  return levels;
}

export function OrderBook({ yesPrice }: { yesPrice: number }) {
  const bids = makeBook(yesPrice, "yes");
  const asks = makeBook(yesPrice, "no").reverse();
  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Order Book</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Yes
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-1 pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <span>Price</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Total</span>
      </div>

      <div className="space-y-0.5">
        {asks.map((a, i) => {
          const total = asks.slice(i).reduce((s, x) => s + x.size, 0);
          const w = (a.size / maxSize) * 100;
          return (
            <div key={`a-${i}`} className="relative grid grid-cols-3 gap-2 px-1 py-1 text-xs num">
              <div
                className="absolute inset-y-0 right-0 bg-no/10 rounded"
                style={{ width: `${w}%` }}
              />
              <span className="relative text-no font-semibold">{(a.price * 100).toFixed(1)}¢</span>
              <span className="relative text-right text-foreground/80">
                {a.size.toLocaleString()}
              </span>
              <span className="relative text-right text-muted-foreground">
                {total.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="my-2 flex items-center justify-center rounded-lg bg-surface-elevated py-2 num">
        <span className="text-yes font-bold">{(yesPrice * 100).toFixed(1)}¢</span>
        <span className="mx-2 text-muted-foreground text-xs">spread 2.0¢</span>
      </div>

      <div className="space-y-0.5">
        {bids.map((b, i) => {
          const total = bids.slice(0, i + 1).reduce((s, x) => s + x.size, 0);
          const w = (b.size / maxSize) * 100;
          return (
            <div key={`b-${i}`} className="relative grid grid-cols-3 gap-2 px-1 py-1 text-xs num">
              <div
                className="absolute inset-y-0 right-0 bg-yes/10 rounded"
                style={{ width: `${w}%` }}
              />
              <span className="relative text-yes font-semibold">{(b.price * 100).toFixed(1)}¢</span>
              <span className="relative text-right text-foreground/80">
                {b.size.toLocaleString()}
              </span>
              <span className="relative text-right text-muted-foreground">
                {total.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
