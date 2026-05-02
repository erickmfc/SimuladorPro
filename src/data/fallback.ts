/**
 * Fallback data for when API-Football is unavailable or key is missing.
 * Focus: Brasileirão Série A (ID: 71) and World Cup.
 */

export interface Team {
  id: number;
  name: string;
  logo: string;
  strength: number; // 0-100 for simulation fallback
}

export function getTeamColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-500',
    'bg-orange-500', 'bg-cyan-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const BRASILEIRAO_TEAMS: Team[] = [
  { id: 134, name: "Athletico-PR", logo: "https://media.api-sports.io/football/teams/134.png", strength: 81 },
  { id: 1062, name: "Atlético-MG", logo: "https://media.api-sports.io/football/teams/1062.png", strength: 85 },
  { id: 118, name: "Bahia", logo: "https://media.api-sports.io/football/teams/118.png", strength: 80 },
  { id: 120, name: "Botafogo", logo: "https://media.api-sports.io/football/teams/120.png", strength: 82 },
  { id: 129, name: "Bragantino", logo: "", strength: 78 },
  { id: 122, name: "Chapecoense", logo: "https://media.api-sports.io/football/teams/122.png", strength: 68 },
  { id: 131, name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png", strength: 77 },
  { id: 1205, name: "Coritiba", logo: "", strength: 75 },
  { id: 135, name: "Cruzeiro", logo: "https://media.api-sports.io/football/teams/135.png", strength: 77 },
  { id: 127, name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png", strength: 89 },
  { id: 124, name: "Fluminense", logo: "https://media.api-sports.io/football/teams/124.png", strength: 85 },
  { id: 130, name: "Grêmio", logo: "https://media.api-sports.io/football/teams/130.png", strength: 78 },
  { id: 119, name: "Internacional", logo: "https://media.api-sports.io/football/teams/119.png", strength: 76 },
  { id: 1143, name: "Mirassol", logo: "https://soccer-api-logos.s3.amazonaws.com/1143.png", strength: 70 },
  { id: 121, name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/121.png", strength: 88 },
  { id: 1144, name: "Remo", logo: "", strength: 68 },
  { id: 128, name: "Santos", logo: "https://media.api-sports.io/football/teams/128.png", strength: 75 },
  { id: 126, name: "São Paulo", logo: "https://media.api-sports.io/football/teams/126.png", strength: 83 },
  { id: 133, name: "Vasco", logo: "https://media.api-sports.io/football/teams/133.png", strength: 77 },
  { id: 147, name: "Vitória", logo: "https://media.api-sports.io/football/teams/147.png", strength: 74 },
];

export const WORLD_CUP_TEAMS: Team[] = [];

export interface BannerData {
  title: string;
  subtitle: string;
  matchInfo: string;
  analysisSummary: string;
  callToAction: string;
  gameId: number;
  homeTeamName?: string;
  awayTeamName?: string;
}

export const BANNER_FALLBACKS: BannerData[] = [
  {
    title: "O RETORNO DO LEÃO",
    subtitle: "REMO VS MIRASSOL",
    matchInfo: "DOMINGO, 12/07/2026 ÀS 16:00 - MANGUEIRÃO, PA",
    analysisSummary: "O Remo busca consolidar sua força em casa contra a equipe do Mirassol que vem de uma sequência positiva no campeonato.",
    callToAction: "SIMULAR JOGO",
    gameId: 101,
    homeTeamName: "Remo",
    awayTeamName: "Mirassol"
  },
  {
    title: "BATALHA NO SUL",
    subtitle: "CHAPECOENSE VS BRAGANTINO",
    matchInfo: "SÁBADO, 11/07/2026 ÀS 18:30 - ARENA CONDÁ, SC",
    analysisSummary: "Duelo tático entre a solidez defensiva de Chapecó e a velocidade de transição do Massa Bruta.",
    callToAction: "ANALISAR ODDS",
    gameId: 102,
    homeTeamName: "Chapecoense",
    awayTeamName: "Bragantino"
  }
];

