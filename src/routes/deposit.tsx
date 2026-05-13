import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { initiateSTKPush } from "@/integrations/daraja";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Wallet, Phone, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/deposit")({
  component: DepositPage,
});

const depositSchema = z.object({
  phone: z.string().regex(/^2547\d{8}$/, "Phone must be 2547xxxxxxxx").trim(),
  amount: z.coerce.number().int().min(10, "Minimum KSh 10"),
});

function DepositPage() {
  const { profile, deposit } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(50);
  const [countdown, setCountdown] = useState(0);
  const [waiting, setWaiting] = useState(false);

  // 50s Countdown with auto-redirect to dashboard
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (waiting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            setWaiting(false);
            toast.info("⏰ STK expired");
            navigate({ to: "/" });
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [waiting, countdown, navigate]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = depositSchema.safeParse({ phone, amount });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setBusy(true);
    try {
      toast.loading("Sending M-Pesa STK Push...", { id: "mpesa" });
      await new Promise(r => setTimeout(r, 1500));
      
      // Trigger M-Pesa STK push from the front-end.
      const { success } = await initiateSTKPush(parsed.data.phone, parsed.data.amount);
      if (!success) {
        throw new Error("M-Pesa STK push failed");
      }

      toast.dismiss("mpesa");

      // Start 50s M-Pesa PIN timer
      setCountdown(50);
      setWaiting(true);
      
    } catch (error) {
      setBusy(false);
      toast.error("Deposit failed");
    }
  };

  const cancelSTK = () => {
    setWaiting(false);
    setBusy(false);
    toast.info("Payment cancelled");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="glass-strong w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl gradient-yes glow-yes">
              <Wallet className="h-10 w-10 text-yes-foreground" />
            </div>
            <CardTitle>Sign in to deposit</CardTitle>
            <CardDescription>Wallet access required</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gradient-yes h-12 font-semibold" onClick={() => navigate({ to: '/auth' })}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background/50 to-muted/80">
      <Card className="glass-strong w-full max-w-md shadow-2xl border-0">
        {waiting ? (
          /* M-Pesa STK PIN Waiting - 50s Countdown */
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-2xl gradient-yes glow-yes border-4 border-dashed border-yes/50">
                <Phone className="h-10 w-10 text-yes-foreground" />
              </div>
              <CardTitle className="text-2xl tracking-tight mb-1">M-Pesa PIN</CardTitle>
              <CardDescription className="text-lg !mb-8">
                Enter PIN on phone:<br className="md:hidden" />
                <span className="font-mono font-bold text-xl bg-muted px-3 py-1 rounded-lg">{phone}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 p-8">
              {/* 50s Progress + Countdown */}
              <div className="space-y-4">
                <div className="mx-auto w-80 h-4 bg-gradient-to-r from-muted/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full gradient-yes transition-all duration-1000 ease-linear shadow-glow-yes" 
                    style={{ width: `${(50 - countdown) / 50 * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold bg-gradient-to-r from-yes to-orange-500 bg-clip-text text-transparent drop-shadow-lg mb-1">
                    {Math.ceil(countdown)}s
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Time remaining</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-16 font-bold border-2 hover:border-destructive hover:bg-destructive/5" 
                  onClick={cancelSTK}
                >
                  <ArrowLeft className="h-5 w-5 mr-2 -ml-1" />
                  Dashboard
                </Button>
                <Button disabled className="flex-1 h-16 gradient-yes font-bold text-lg shadow-2xl">
                  <Clock className="h-6 w-6 mr-2" />
                  Waiting...
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          /* Deposit Form */
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-2xl gradient-yes glow-yes">
                <Wallet className="h-8 w-8 text-yes-foreground" />
              </div>
              <CardTitle className="text-2xl tracking-tight flex items-center justify-center gap-2 mb-2">
                Wallet Deposit
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-yes mb-4">
                KSh <span className="text-3xl">{profile.balance_kes?.toLocaleString() || '0'}</span>
              </div>
              <CardDescription className="text-center !text-xs">
                Instant wallet credit via M-Pesa
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-8">
              {/* Official M-Pesa Logo */}
              <div className="flex items-center justify-center p-6 glass-strong rounded-2xl border-2 border-dashed border-border/50">
                <img 
                  src="/mpesa-logo.png" 
                  alt="M-Pesa Logo"
                  className="h-20 w-32 object-contain drop-shadow-xl"
                />
              </div>

              <form onSubmit={handleDeposit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^254/, '254'))}
                    placeholder="254712345678"
                    className="h-14 text-lg font-semibold border-2 focus-visible:ring-2 focus-visible:ring-yes/50"
                    required
                    disabled={busy}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    💰 Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(10, Number(e.target.value)))}
                    min="10"
                    step="10"
                    placeholder="100"
                    className="h-14 text-2xl font-bold text-yes border-2 focus-visible:ring-2 focus-visible:ring-yes/50"
                    required
                    disabled={busy}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    Min KSh 10 • No fees
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={busy || phone.length < 12 || amount < 10}
                  className="w-full h-16 text-xl font-bold shadow-2xl gradient-yes text-yes-foreground hover:shadow-glow-yes"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Sending STK...
                    </>
                  ) : (
                    "💳 Pay with M-Pesa"
                  )}
                </Button>
              </form>

              <div className="pt-8 border-t border-border/50 text-xs text-center text-muted-foreground">
                <p>Daily limit KSh 70,000</p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

