import { CATEGORIES } from "@/lib/markets";
import { cn } from "@/lib/utils";
import { Flame, Vote, Bitcoin, Trophy, Clapperboard, Sparkles } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  All: Flame,
  Politics: Vote,
  Crypto: Bitcoin,
  Sports: Trophy,
  "Pop Culture": Clapperboard,
};

interface Props {
  active: string;
  onChange: (c: string) => void;
}

export function CategoryNav({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
      {CATEGORIES.map((c) => {
        const Icon = ICONS[c] ?? Sparkles;
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-yes text-yes-foreground border-transparent shadow-[0_0_20px_var(--yes-glow)]"
                : "glass border-border/60 text-foreground/80 hover:text-foreground hover:border-border"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {c}
          </button>
        );
      })}
    </div>
  );
}
