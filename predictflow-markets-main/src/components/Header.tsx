import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Wallet,
  TrendingUp,
  LogOut,
  User as UserIcon,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatKESRaw } from "@/lib/markets";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-yes glow-yes">
            <TrendingUp className="h-5 w-5 text-yes-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Pulse<span className="text-yes">Market</span>
          </span>
        </Link>

        <div className="relative hidden md:block flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets, events, topics…"
            className="pl-9 bg-surface/60 border-border/80 h-10"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : user && profile ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Balance
                </span>
                <span className="text-sm font-semibold num text-yes">
                  {formatKESRaw(profile.balance_kes)}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 border-border/80 bg-surface/60">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || ""}
                        className="h-6 w-6 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-yes text-[11px] font-bold text-yes-foreground">
                        {profile.display_name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm font-medium">
                      {profile.display_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{profile.display_name}</span>
                    <span className="text-[11px] font-normal text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>Balance: {formatKESRaw(profile.balance_kes)}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/deposit" })}
                    className="gap-2 text-yes-foreground font-semibold"
                  >
                    <Wallet className="h-4 w-4 text-yes" />
                    💳 Deposit MPESA
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="gap-2 text-destructive focus:bg-destructive/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="gradient-yes text-yes-foreground hover:opacity-90 font-semibold gap-2 shadow-lg"
            >
              <Wallet className="h-4 w-4" />
              <span>Sign in</span>
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}
