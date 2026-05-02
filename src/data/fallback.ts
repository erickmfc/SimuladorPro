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
  { id: 129, name: "Bragantino", logo: "https://upload.wikimedia.org/wikipedia/pt/9/9e/Red_Bull_Bragantino.png", strength: 78 },
  { id: 122, name: "Chapecoense", logo: "https://media.api-sports.io/football/teams/122.png", strength: 68 },
  { id: 131, name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png", strength: 77 },
  { id: 1205, name: "Coritiba", logo: "https://upload.wikimedia.org/wikipedia/pt/0/07/Coritiba_FBC_2023.png", strength: 75 },
  { id: 135, name: "Cruzeiro", logo: "https://media.api-sports.io/football/teams/135.png", strength: 77 },
  { id: 127, name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png", strength: 89 },
  { id: 124, name: "Fluminense", logo: "https://media.api-sports.io/football/teams/124.png", strength: 85 },
  { id: 130, name: "Grêmio", logo: "https://media.api-sports.io/football/teams/130.png", strength: 78 },
  { id: 119, name: "Internacional", logo: "https://media.api-sports.io/football/teams/119.png", strength: 76 },
  { id: 1143, name: "Mirassol", logo: "https://upload.wikimedia.org/wikipedia/pt/1/1a/Mirassol_Futebol_Clube_logo.png", strength: 70 },
  { id: 121, name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/121.png", strength: 88 },
  { id: 1144, name: "Remo", logo: "https://media.api-sports.io/football/teams/1144.png", strength: 68 },
  { id: 128, name: "Santos", logo: "https://media.api-sports.io/football/teams/128.png", strength: 75 },
  { id: 126, name: "São Paulo", logo: "https://media.api-sports.io/football/teams/126.png", strength: 83 },
  { id: 133, name: "Vasco", logo: "https://media.api-sports.io/football/teams/133.png", strength: 77 },
  { id: 147, name: "Vitória", logo: "https://media.api-sports.io/football/teams/147.png", strength: 74 },
];

export const WORLD_CUP_TEAMS: Team[] = [];

