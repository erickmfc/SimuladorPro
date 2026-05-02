import { Team, Match, StandingEntry } from "../types";
import { BRASILEIRAO_TEAMS, WORLD_CUP_TEAMS } from "../data/fallback";

import { getMatchesForRound } from "../data/schedule";

export type CompetitionType = "brasileirao" | "worldcup";

export enum DataSource {
  REAL = "REAL",
  ALTERNATIVE = "ALTERNATIVE",
  DEMO = "DEMO",
  AI_SMART_SEARCH = "AI_SMART_SEARCH"
}

export interface CompetitionData {
  teams: Team[];
  matches: Match[];
  initialStandings?: StandingEntry[];
  currentRound?: string;
  season: number;
  isDemo: boolean;
  dataSource: DataSource;
}


export class FootballService {
  private static BASE_URL = "/api/football";

  private static LEAGUE_IDS = {
    brasileirao: 71,
    worldcup: 1,
  };

  static async getCompetitionData(type: CompetitionType, round?: number): Promise<CompetitionData> {
    if (type === "brasileirao") {
      const activeRound = round || 14;
      const { BRASILEIRAO_FALLBACK } = await import("../data/fallbackData");
      const matches = getMatchesForRound(activeRound);

      return {
        teams: BRASILEIRAO_TEAMS,
        matches,
        initialStandings: BRASILEIRAO_FALLBACK.standings,
        currentRound: `${activeRound}ª Rodada`,
        season: 2026,
        isDemo: true,
        dataSource: DataSource.DEMO
      };
    }

    const leagueId = this.LEAGUE_IDS[type];
    
    // 1. Attempt Primary API
    try {
      // 1. Get current season/year dynamically
      const leagueRes = await fetch(`${this.BASE_URL}/leagues?id=${leagueId}&current=true`);
      const leagueData = await leagueRes.json();
      const leagueInfo = leagueData.response?.[0];
      
      if (!leagueInfo) throw new Error("League details not found");
      const currentSeasonInfo = leagueInfo.seasons.find((s: any) => s.current === true);
      if (!currentSeasonInfo) throw new Error("No current season found for league");
      const season = currentSeasonInfo.year;

      // 2. Get teams for this season
      const teamsRes = await fetch(`${this.BASE_URL}/teams?league=${leagueId}&season=${season}`);
      const teamsData = await teamsRes.json();
      const teams: Team[] = (teamsData.response || []).map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        logo: item.team.logo,
        strength: 75,
      }));

      // 3. Get initial standings
      const standingsRes = await fetch(`${this.BASE_URL}/standings?league=${leagueId}&season=${season}`);
      const standingsData = await standingsRes.json();
      const initialStandings: StandingEntry[] = [];
      const apiStandingsResponse = standingsData.response?.[0]?.league?.standings?.[0] || [];
      
      apiStandingsResponse.forEach((item: any) => {
        const team = teams.find(t => t.id === item.team.id);
        if (team) {
          initialStandings.push({
            team,
            played: item.all.played,
            won: item.all.win,
            drawn: item.all.draw,
            lost: item.all.lose,
            points: item.points,
            goalsFor: item.all.goals.for,
            goalsAgainst: item.all.goals.against
          });
        }
      });

      // 4. Get current round text exactly
      const roundRes = await fetch(`${this.BASE_URL}/fixtures/rounds?league=${leagueId}&season=${season}&current=true`);
      const roundData = await roundRes.json();
      const currentRoundText = roundData.response?.[0];

      if (!currentRoundText) throw new Error("No current round found");

      // 5. Get fixtures for current round text
      const fixturesRes = await fetch(`${this.BASE_URL}/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(currentRoundText)}`);
      const fixturesData = await fixturesRes.json();
      const rawFixtures = fixturesData.response || [];

      const matches: Match[] = rawFixtures.map((item: any) => ({
        id: String(item.fixture.id),
        homeTeam: teams.find(t => t.id === item.teams.home.id) || { 
          id: item.teams.home.id, 
          name: item.teams.home.name, 
          logo: item.teams.home.logo, 
          strength: 75 
        },
        awayTeam: teams.find(t => t.id === item.teams.away.id) || { 
          id: item.teams.away.id, 
          name: item.teams.away.name, 
          logo: item.teams.away.logo, 
          strength: 75 
        },
        date: item.fixture.date,
        status: item.fixture.status.short === "FT" ? "finished" : "pending",
        homeScore: item.goals.home,
        awayScore: item.goals.away
      }));

      // VALIDATION LOGS
      console.log("--- DATA VALIDATION (REAL) ---");
      console.log("season", season);
      console.log("currentRound", currentRoundText);
      console.log("teams", teams.length);
      console.log("fixtures", matches.length);
      console.log("standings", initialStandings.length);
      console.log("-----------------------");

      return {
        teams,
        matches,
        initialStandings,
        currentRound: currentRoundText,
        season,
        isDemo: false,
        dataSource: DataSource.REAL
      };

    } catch (error) {
      console.warn("Primary API failed, attempting Fallback Data:", error);
      
      try {
        const { BRASILEIRAO_FALLBACK, WORLD_CUP_FALLBACK } = await import("../data/fallbackData");
        const fallback = (type as string) === "brasileirao" ? BRASILEIRAO_FALLBACK : WORLD_CUP_FALLBACK;

        return {
          teams: fallback.teams,
          matches: fallback.matches.length > 0 ? fallback.matches : [],
          initialStandings: fallback.standings.length > 0 ? fallback.standings : [],
          currentRound: fallback.currentRound,
          season: fallback.season,
          isDemo: true,
          dataSource: DataSource.ALTERNATIVE
        };
      } catch (fallbackError) {
        console.error("Fallback data import failed:", fallbackError);
        // Pure demo mode as absolute last resort
        const teams = (type as string) === "brasileirao" ? BRASILEIRAO_TEAMS : WORLD_CUP_TEAMS;
        return {
          teams,
          matches: [],
          initialStandings: [],
          currentRound: "Demo Mode",
          season: new Date().getFullYear(),
          isDemo: true,
          dataSource: DataSource.DEMO
        };
      }
    }
  }

  static simulateMatch(home: Team, away: Team): { homeScore: number; awayScore: number } {
    const homeWeight = home.strength + 10; 
    const awayWeight = away.strength;
    
    // Weighted random score
    const simulateGoals = (weight: number) => {
      const rand = Math.random() * weight;
      if (rand > 80) return Math.floor(Math.random() * 5);
      if (rand > 60) return Math.floor(Math.random() * 3);
      if (rand > 40) return Math.floor(Math.random() * 2);
      return 0;
    };

    return { 
      homeScore: simulateGoals(homeWeight), 
      awayScore: simulateGoals(awayWeight) 
    };
  }

  static async getTopScorers(type: CompetitionType, season: number): Promise<any[]> {
    const leagueId = this.LEAGUE_IDS[type];
    try {
      const res = await fetch(`${this.BASE_URL}/players/topscorers?league=${leagueId}&season=${season}`);
      const data = await res.json();
      return data.response || [];
    } catch (error) {
      console.error("Failed to fetch top scorers:", error);
      return [];
    }
  }

  static async getTopAssists(type: CompetitionType, season: number): Promise<any[]> {
    const leagueId = this.LEAGUE_IDS[type];
    try {
      const res = await fetch(`${this.BASE_URL}/players/topassists?league=${leagueId}&season=${season}`);
      const data = await res.json();
      return data.response || [];
    } catch (error) {
      console.error("Failed to fetch top assists:", error);
      return [];
    }
  }
}
