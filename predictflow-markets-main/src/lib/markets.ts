export type Category = "Politics" | "Crypto" | "Sports" | "Pop Culture";

export interface Market {
  id: string;
  question: string;
  category: Category;
  yesPrice: number; // 0..1 probability
  change24h: number; // delta in probability points, e.g. +0.04
  volume: number;
  liquidity: number;
  endsAt: string;
  image: string;
  history: { t: number; p: number }[];
}

export const KENYAN_EVENTS: string[] = [
  // Politics (12)
  "Kenya negotiating new IMF deal (Feb–March 2026)",
  "Budget deficit projected at 5.3% for 2026/27",
  "Recruitment for new Supreme Court judge ongoing",
  "Proposed law to make drug trafficking a capital offence",
  "Parliament consultations on 2026/27 budget",
  "Increased domestic borrowing strategy rollout",
  "County-level governance reforms discussions",
  "Public participation forums on fiscal policy",
  "Anti-corruption campaigns and oversight",
  "Election preparedness discussions for 2027",
  "Political conferences and forums across Kenya",
  "Government drought response funding (KSh 6B)",
  
  // Sports (12)
  "Kenyan athlete John Korir wins Boston Marathon 2026",
  "Kenya participates in Winter Olympics 2026",
  "Magical Kenya Open golf tournament (Feb 2026)",
  "Casey Jarvis wins Magical Kenya Open",
  "Talanta Sports Stadium nearing completion (80%)",
  "AFCON 2027 infrastructure preparations ongoing",
  "Kenya Wildlife Marathon (May 24, 2026)",
  "Lewa Safari Marathon (June 2026)",
  "Harambee Stars World Cup qualification buildup",
  "Stadium upgrades (Nyayo Stadium events readiness)",
  "Athlete nationality transfer controversy (Kenyan athletes)",
  "Youth sports talent programs expansion",
  
  // Entertainment (12)
  "Kalasha Awards 2026 (May 2, Nairobi)",
  "Cannes Lions Kenya qualifiers winners announced",
  "Film screenings across Anga Cinemas (April 2026)",
  "Growing Kenyan film & streaming industry",
  "Music concerts and nightlife events in Nairobi",
  "Digital creators monetization expansion",
  "Stand-up comedy and live performance circuits",
  "Influencer marketing campaigns growth",
  "Creative festivals and showcases",
  "Fashion events and runway shows",
  "Art exhibitions and gallery openings",
  "Youth-driven urban culture events",
  
  // Culture (12)
  "Bullfighting festivals in Kakamega gaining popularity",
  "National holidays calendar rollout",
  "Madaraka Day (June 1) celebrations",
  "Mashujaa Day (Oct 20) planning",
  "Jamhuri Day (Dec 12) preparations",
  "Idd-ul-Fitr national observance",
  "Christmas & Boxing Day celebrations",
  "Cultural festivals across counties",
  "World Health Summit (April 27–29, Nairobi)",
  "Our Ocean Conference (June, Mombasa & Kilifi)",
  "Global Data Festival (June 2026)",
  "AfricArena Nairobi Summit (April 2026)",
  
  // Breaking (12)
  "2026 Kenya floods (110+ deaths, displacement)",
  "Building collapse in Nairobi (Jan 2026)",
  "Helicopter crash killing MP Johana Ng'en",
  "Al-Shabaab attack in Garissa",
  "Cholera and malaria risk warnings after floods",
  "Urban planning and drainage crisis debates",
  "Climate change and extreme weather discussions",
  "Missing Kenyans in Russia military recruitment issue",
  "Shakahola-related court cases continuing",
  "Infrastructure demolitions for AFCON 2027 projects",
  "Proposed law to make drug trafficking a capital offence",
  "Recruitment for new Supreme Court judge ongoing"
];

const emoji: Record<Category, string> = {
  Politics: "🗳️",
  Crypto: "₿",
  Sports: "🏆",
  "Pop Culture": "🎬",
};

function genHistory(end: number, days = 60) {
  let p = Math.max(0.05, Math.min(0.95, end + (Math.random() - 0.5) * 0.4));
  const out: { t: number; p: number }[] = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
  p = Math.max(0.02, Math.min(0.98, p + (Math.random() - 0.5) * 0.06));
  if (i === 0) p = end;
  out.push({ t: now - i * 86400000, p: Number(p.toFixed(3)) });
  }
  return out;
}

// Generate 60 markets from KENYAN_EVENTS
export const MARKETS: Market[] = KENYAN_EVENTS.map((question, index) => ({
  id: `market-${index}`,
  question,
  category: index < 12 ? "Politics" : 
            index < 24 ? "Sports" : 
            index < 36 ? "Pop Culture" : "Politics",
  yesPrice: Number((0.1 + Math.random() * 0.8).toFixed(3)),
  change24h: Number((Math.random() * 0.1 - 0.05).toFixed(3)),
  volume: Math.floor(100000 + Math.random() * 5000000),
  liquidity: Math.floor(50000 + Math.random() * 1000000),
  endsAt: new Date(Date.now() + Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0],
  image: emoji[ index < 12 ? "Politics" : 
               index < 24 ? "Sports" : 
               index < 36 ? "Pop Culture" : "Politics"],
  history: genHistory(Number((0.1 + Math.random() * 0.8).toFixed(3))),
}));

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Politics",
  "Crypto",
  "Sports",
  "Pop Culture",
];

export function getMarket(id: string) {
  return MARKETS.find((m) => m.id === id);
}

const KES_RATE = 130;

export function formatKES(n: number) {
  const v = n * KES_RATE;
  if (v >= 1_000_000_000) return `KSh ${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `KSh ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `KSh ${(v / 1_000).toFixed(1)}K`;
  return `KSh ${v.toFixed(0)}`;
}

export function formatKESRaw(n: number) {
  return `KSh ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

