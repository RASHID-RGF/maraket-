import { useEffect, useState } from "react";
import { MARKETS, KENYAN_EVENTS, formatKESRaw } from "@/lib/markets";
// Firebase realtime replaces Supabase
import { Globe2, Zap } from "lucide-react";

type Side = "YES" | "NO";
interface PulseEvent {
  id: string;
  city: string;
  flag: string;
  market: string;
  side: Side;
  amount: number;
  price: number;
  ts: number;
  real?: boolean;
}

import { KENYAN_CITIES } from "@/lib/kenyan-cities";

const LOCATIONS = KENYAN_CITIES.map(city => ({ city, flag: "🇰🇪" } as const));

let counter = 0;
function makeEvent(): PulseEvent {
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
  const m = KENYAN_EVENTS[Math.floor(Math.random() * KENYAN_EVENTS.length)] || market.question as string;
  const side: Side = Math.random() > 0.5 ? "YES" : "NO";
  const price = side === "YES" ? market.yesPrice : 1 - market.yesPrice;
  return {
    id: `sim-${++counter}`,
    city: loc.city,
    flag: loc.flag,
    market: m.question,
    side,
    amount: Math.round((100 + Math.random() * 19900) / 50) * 50,
    price: Number(price.toFixed(2)),
    ts: Date.now(),
  };
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function LivePulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  // Client-side initial events to fix hydration
  useEffect(() => {
    const initial = Array.from({ length: 20 }, (_, i) => ({
      ...makeEvent(),
      ts: Date.now() - (i + 1) * 1500,
    }));
    setEvents(initial);
  }, []);
  const [, force] = useState(0);

  // Tick to refresh "Xs ago" labels
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulated stream
  useEffect(() => {
    const tick = setInterval(() => {
      setEvents((prev) => [makeEvent(), ...prev.slice(0, 24)].slice(0, 25));
    }, 800);
    return () => clearInterval(tick);
  }, []);

  // Realtime: real bets from Supabase
  // TODO: Firebase Firestore listener on 'bets' collection
  useEffect(() => {
    // const q = query(collection(db, 'bets'), orderBy('created_at', 'desc'), limit(10));
    // const unsub = onSnapshot(q, (snap) => { ... });
    // return unsub;
  }, []);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yes opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-yes" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight">Live Pulse</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Kenya · Realtime
          </span>
        </div>
        <Globe2 className="h-4 w-4 text-muted-foreground" />
      </div>

      <ul className="divide-y divide-border/50 max-h-[440px] overflow-hidden">
        {events.map((e, i) => (
          <li
            key={e.id}
            className="flex items-center gap-3 px-5 py-3 transition-all"
            style={{ animation: i === 0 ? "pulseIn 600ms ease-out" : undefined }}
          >
            <span className="text-lg shrink-0" aria-hidden>
              {e.flag}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground/80">{e.city}</span>
                <span>·</span>
                <span className="num">{timeAgo(e.ts)}</span>
                {e.real && (
                  <span className="ml-1 rounded bg-yes/20 px-1 py-px text-[9px] font-bold text-yes uppercase">
                    Live
                  </span>
                )}
              </div>
              <p className="truncate text-[13px] leading-snug">{e.market}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  e.side === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no"
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                {e.side} @ {Math.round(e.price * 100)}¢
              </span>
              <span className="mt-0.5 text-[11px] text-muted-foreground num">
                {formatKESRaw(e.amount)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes pulseIn {
          0% { opacity: 0; transform: translateY(-6px); background: oklch(0.85 0.18 195 / 0.12); }
          100% { opacity: 1; transform: translateY(0); background: transparent; }
        }
      `}</style>
    </div>
  );
}
