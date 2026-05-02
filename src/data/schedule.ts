
import { Team, Match } from "../types";
import { BRASILEIRAO_TEAMS } from "./fallback";

const findTeam = (name: string): Team => {
  const team = BRASILEIRAO_TEAMS.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
  if (!team) {
    // Return a dummy team if not found to avoid crashes, though we should have them all
    return { id: Math.random(), name, logo: "", strength: 50 };
  }
  return team;
};

export const BRASILEIRAO_SCHEDULE: Record<number, { home: string, away: string }[]> = {
  1: [
    { home: "Fluminense", away: "Grêmio" }, { home: "Botafogo", away: "Cruzeiro" }, { home: "São Paulo", away: "Flamengo" },
    { home: "Corinthians", away: "Bahia" }, { home: "Mirassol", away: "Vasco" }, { home: "Atlético-MG", away: "Palmeiras" },
    { home: "Internacional", away: "Athletico-PR" }, { home: "Coritiba", away: "RB Bragantino" }, { home: "Vitória", away: "Remo" },
    { home: "Chapecoense", away: "Santos" }
  ],
  2: [
    { home: "Flamengo", away: "Internacional" }, { home: "Vasco", away: "Chapecoense" }, { home: "Santos", away: "São Paulo" },
    { home: "Palmeiras", away: "Vitória" }, { home: "RB Bragantino", away: "Atlético-MG" }, { home: "Cruzeiro", away: "Coritiba" },
    { home: "Grêmio", away: "Botafogo" }, { home: "Athletico-PR", away: "Corinthians" }, { home: "Bahia", away: "Fluminense" },
    { home: "Remo", away: "Mirassol" }
  ],
  13: [
    { home: "Fluminense", away: "Chapecoense" }, { home: "Botafogo", away: "Internacional" }, { home: "São Paulo", away: "Mirassol" },
    { home: "Corinthians", away: "Vasco" }, { home: "RB Bragantino", away: "Palmeiras" }, { home: "Atlético-MG", away: "Flamengo" },
    { home: "Grêmio", away: "Coritiba" }, { home: "Athletico-PR", away: "Vitória" }, { home: "Bahia", away: "Santos" },
    { home: "Remo", away: "Cruzeiro" }
  ],
  14: [
    { home: "Flamengo", away: "Vasco" }, { home: "Botafogo", away: "Remo" }, { home: "São Paulo", away: "Bahia" },
    { home: "Palmeiras", away: "Santos" }, { home: "Mirassol", away: "Corinthians" }, { home: "Cruzeiro", away: "Atlético-MG" },
    { home: "Internacional", away: "Fluminense" }, { home: "Athletico-PR", away: "Grêmio" }, { home: "Vitória", away: "Coritiba" },
    { home: "Chapecoense", away: "RB Bragantino" }
  ],
  15: [
    { home: "Fluminense", away: "Vitória" }, { home: "Vasco", away: "Athletico-PR" }, { home: "Santos", away: "RB Bragantino" },
    { home: "Corinthians", away: "São Paulo" }, { home: "Mirassol", away: "Chapecoense" }, { home: "Atlético-MG", away: "Botafogo" },
    { home: "Grêmio", away: "Flamengo" }, { home: "Coritiba", away: "Internacional" }, { home: "Bahia", away: "Cruzeiro" },
    { home: "Remo", away: "Palmeiras" }
  ]
};

export const getMatchesForRound = (round: number): Match[] => {
  const pairings = BRASILEIRAO_SCHEDULE[round] || BRASILEIRAO_SCHEDULE[14]; // Fallback to 14 if not specifically defined
  return pairings.map((p, i) => ({
    id: `round-${round}-${i}`,
    homeTeam: findTeam(p.home),
    awayTeam: findTeam(p.away),
    date: new Date(2026, 4, 1 + round).toISOString(),
    status: "pending"
  }));
};
