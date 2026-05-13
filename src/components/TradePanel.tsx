import { useState } from "react";
import type { Market } from "@/lib/markets";
import { formatKESRaw } from "@/lib/markets";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Firebase replaces Supabase
import { useNavigate } from "@tanstack/react-router";
import { db } from "@/integrations/firebase/client";
import { 
  addDoc, 
  collection, 
  doc, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { toast } from "sonner";


type Side = "yes" | "no";

export function TradePanel({
  market,
  compact = false,
}: {
  market: Market;
  compact?: boolean;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [side, setSide] = useState<Side>("yes");
  const [amount, setAmount] = useState(500); // KES
  const [submitting, setSubmitting] = useState(false);

  const price = side === "yes" ? market.yesPrice : 1 - market.yesPrice;
  const cents = Math.round(price * 100);
  const shares = amount / price;
  const potentialReturn = shares; // resolves to 1 KES unit per share
  const profit = potentialReturn - amount;
  const roi = (profit / amount) * 100;

  const balance = profile?.balance_kes ?? 0;
  const insufficient = !!user && amount > balance;

  const handlePlaceBet = async () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (insufficient) {
      toast.error("Insufficient balance");
      return;
    }
    setSubmitting(true);
    try {
      // Place bet
      await addDoc(collection(db, "bets"), {
        userId: user.uid,
        marketId: market.id,
        side,
        shares: shares,
        price: price,
        amount: amount,
        createdAt: serverTimestamp(),
      });

      // Deduct balance
      await setDoc(
        doc(db, "profiles", user.uid),
        { balance_kes: profile!.balance_kes - amount },
        { merge: true }
      );

      toast.success(
        `${side.toUpperCase()} ${formatKESRaw(amount)} on "${market.question.slice(0, 40)}…" bet placed!`
      );
      refreshProfile();
    } catch (error: any) {
      toast.error(`Bet failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "glass-strong rounded-2xl p-5 flex flex-col gap-4",
        compact ? "" : "sticky top-20"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Place a trade</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{market.question}</p>
        </div>
        {profile && (
          <div className="text-right shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Balance
            </div>
            <div className="text-xs font-semibold text-yes num">
              {formatKESRaw(profile.balance_kes)}
            </div>
          </div>
        )}
      </div>

      {/* Side toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSide("yes")}
          className={cn(
            "rounded-xl py-3 font-semibold transition-all border",
            side === "yes"
              ? "gradient-yes text-yes-foreground border-transparent glow-yes"
              : "bg-surface text-yes border-border hover:border-yes/40"
          )}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-80">Buy Yes</div>
          <div className="num text-lg">{Math.round(market.yesPrice * 100)}¢</div>
        </button>
        <button
          onClick={() => setSide("no")}
          className={cn(
            "rounded-xl py-3 font-semibold transition-all border",
            side === "no"
              ? "gradient-no text-no-foreground border-transparent glow-no"
              : "bg-surface text-no border-border hover:border-no/40"
          )}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-80">Buy No</div>
          <div className="num text-lg">{Math.round((1 - market.yesPrice) * 100)}¢</div>
        </button>
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Stake (KES)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-semibold">
              KSh
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
              className="h-8 w-32 pl-9 num bg-surface text-right"
            />
          </div>
        </div>

        <Slider
          value={[amount]}
          onValueChange={(v) => setAmount(v[0])}
          min={50}
          max={50000}
          step={50}
          className={cn(
            side === "yes" ? "[&_[role=slider]]:bg-yes" : "[&_[role=slider]]:bg-no"
          )}
        />

        <div className="flex gap-1.5">
          {[500, 1000, 5000, 10000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="flex-1 rounded-lg bg-surface py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition num"
            >
              {v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-surface/60 p-3 space-y-2 text-sm">
        <Row label="Avg price" value={`${cents}¢`} />
        <Row label="Shares" value={shares.toFixed(1)} />
        <Row
          label="Potential payout"
          value={formatKESRaw(potentialReturn)}
          accent={side}
        />
        <div className="border-t border-border/60 pt-2">
          <Row
            label="Profit"
            value={`+${formatKESRaw(profit)} (${roi.toFixed(0)}%)`}
            accent={side}
            bold
          />
        </div>
      </div>

      <Button
        onClick={handlePlaceBet}
        disabled={submitting || insufficient}
        className={cn(
          "w-full h-12 text-base font-semibold gap-2",
          side === "yes"
            ? "gradient-yes text-yes-foreground hover:opacity-90 glow-yes"
            : "gradient-no text-no-foreground hover:opacity-90 glow-no"
        )}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TrendingUp className="h-4 w-4" />
        )}
        {!user
          ? "Sign in to bet"
          : insufficient
            ? "Insufficient balance"
            : `Buy ${side === "yes" ? "Yes" : "No"} · ${formatKESRaw(amount)}`}
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: Side;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span
        className={cn(
          "num",
          bold ? "font-bold" : "font-medium",
          accent === "yes" && "text-yes",
          accent === "no" && "text-no"
        )}
      >
        {value}
      </span>
    </div>
  );
}
