import { Team, Match, StandingEntry } from "../types";
import { BRASILEIRAO_TEAMS, WORLD_CUP_TEAMS } from "./fallback";

export interface FallbackData {
  teams: Team[];
  matches: Match[];
  standings: StandingEntry[];
  currentRound: string;
  season: number;
}

export const BRASILEIRAO_FALLBACK: FallbackData = {
  season: 2026,
  currentRound: "14ª Rodada",
  teams: BRASILEIRAO_TEAMS,
  standings: [
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 121)!, played: 13, won: 10, drawn: 2, lost: 1, points: 32, goalsFor: 23, goalsAgainst: 10 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 127)!, played: 12, won: 8, drawn: 2, lost: 2, points: 26, goalsFor: 24, goalsAgainst: 10 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 124)!, played: 13, won: 8, drawn: 2, lost: 3, points: 26, goalsFor: 23, goalsAgainst: 16 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 126)!, played: 13, won: 7, drawn: 2, lost: 4, points: 23, goalsFor: 17, goalsAgainst: 11 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 134)!, played: 13, won: 7, drawn: 1, lost: 5, points: 22, goalsFor: 20, goalsAgainst: 15 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 118)!, played: 12, won: 6, drawn: 3, lost: 3, points: 21, goalsFor: 17, goalsAgainst: 14 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 1205)!, played: 13, won: 5, drawn: 4, lost: 4, points: 19, goalsFor: 15, goalsAgainst: 13 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 120)!, played: 12, won: 5, drawn: 2, lost: 5, points: 17, goalsFor: 24, goalsAgainst: 24 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 129)!, played: 13, won: 5, drawn: 2, lost: 6, points: 17, goalsFor: 15, goalsAgainst: 15 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 133)!, played: 13, won: 4, drawn: 4, lost: 5, points: 16, goalsFor: 18, goalsAgainst: 19 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 130)!, played: 13, won: 4, drawn: 4, lost: 5, points: 16, goalsFor: 15, goalsAgainst: 16 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 135)!, played: 13, won: 4, drawn: 4, lost: 5, points: 16, goalsFor: 17, goalsAgainst: 21 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 147)!, played: 12, won: 4, drawn: 3, lost: 5, points: 15, goalsFor: 12, goalsAgainst: 17 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 131)!, played: 13, won: 3, drawn: 6, lost: 4, points: 15, goalsFor: 9, goalsAgainst: 11 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 1062)!, played: 13, won: 4, drawn: 2, lost: 7, points: 14, goalsFor: 14, goalsAgainst: 19 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 119)!, played: 13, won: 3, drawn: 5, lost: 5, points: 14, goalsFor: 12, goalsAgainst: 14 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 128)!, played: 13, won: 3, drawn: 5, lost: 5, points: 14, goalsFor: 18, goalsAgainst: 21 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 1143)!, played: 12, won: 2, drawn: 3, lost: 7, points: 9, goalsFor: 13, goalsAgainst: 18 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 1144)!, played: 13, won: 1, drawn: 5, lost: 7, points: 8, goalsFor: 13, goalsAgainst: 23 },
    { team: BRASILEIRAO_TEAMS.find(t => t.id === 122)!, played: 12, won: 1, drawn: 5, lost: 6, points: 8, goalsFor: 12, goalsAgainst: 24 },
  ],
  matches: [
    { id: "rd14-1", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 127)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 133)!, date: "2026-05-03T16:00:00Z", status: "pending" },
    { id: "rd14-2", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 120)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 1144)!, date: "2026-05-02T16:00:00Z", status: "pending" },
    { id: "rd14-3", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 126)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 118)!, date: "2026-05-03T16:00:00Z", status: "pending" },
    { id: "rd14-4", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 121)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 128)!, date: "2026-05-02T18:30:00Z", status: "pending" },
    { id: "rd14-5", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 1143)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 131)!, date: "2026-05-03T20:30:00Z", status: "pending" },
    { id: "rd14-6", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 135)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 1062)!, date: "2026-05-02T21:00:00Z", status: "pending" },
    { id: "rd14-7", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 119)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 124)!, date: "2026-05-03T18:30:00Z", status: "pending" },
    { id: "rd14-8", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 134)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 130)!, date: "2026-05-02T20:30:00Z", status: "pending" },
    { id: "rd14-9", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 147)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 1205)!, date: "2026-05-02T18:30:00Z", status: "pending" },
    { id: "rd14-10", homeTeam: BRASILEIRAO_TEAMS.find(t => t.id === 122)!, awayTeam: BRASILEIRAO_TEAMS.find(t => t.id === 129)!, date: "2026-05-03T18:30:00Z", status: "pending" },
  ]
};

export const WORLD_CUP_FALLBACK: FallbackData = {
  season: 2022,
  currentRound: "Aguardando Dados...",
  teams: [],
  standings: [],
  matches: []
};

