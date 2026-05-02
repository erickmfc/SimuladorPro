import { GoogleGenAI, Type } from "@google/genai";
import { CompetitionType, CompetitionData, DataSource } from "./footballService";
import { StandingEntry, Team, Match } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class GeminiService {
  private static ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

  static async fetchSmartData(type: CompetitionType): Promise<CompetitionData | null> {
    if (!this.ai) {
      console.error("GEMINI_API_KEY not configured for Smart Search");
      return null;
    }

    const competitionName = type === "brasileirao" ? "Brasileirão Série A 2024" : "Copa do Mundo 2022";
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Fetch the latest data for ${competitionName}. 
        I need the current standings and the most recent round of matches.
        Return the data strictly as JSON matching the following structure:
        {
          "teams": [{"id": number, "name": string, "logo": string, "strength": number}],
          "standings": [{"teamId": number, "played": number, "won": number, "drawn": number, "lost": number, "points": number, "goalsFor": number, "goalsAgainst": number}],
          "matches": [{"id": string, "homeTeamId": number, "awayTeamId": number, "homeScore": number, "awayScore": number, "date": string, "status": "finished" | "pending"}],
          "currentRound": string,
          "season": number
        }
        Use Google Search to ensure the data is accurate as of May 2024 or latest available.`,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              teams: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    name: { type: Type.STRING },
                    logo: { type: Type.STRING },
                    strength: { type: Type.NUMBER }
                  }
                }
              },
              standings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    teamId: { type: Type.NUMBER },
                    played: { type: Type.NUMBER },
                    won: { type: Type.NUMBER },
                    drawn: { type: Type.NUMBER },
                    lost: { type: Type.NUMBER },
                    points: { type: Type.NUMBER },
                    goalsFor: { type: Type.NUMBER },
                    goalsAgainst: { type: Type.NUMBER }
                  }
                }
              },
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    homeTeamId: { type: Type.NUMBER },
                    awayTeamId: { type: Type.NUMBER },
                    homeScore: { type: Type.NUMBER },
                    awayScore: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    status: { type: Type.STRING }
                  }
                }
              },
              currentRound: { type: Type.STRING },
              season: { type: Type.NUMBER }
            }
          }
        }
      });

      const data = JSON.parse(response.text);

      // Map back to our internal structures
      const teams: Team[] = data.teams;
      const teamMap = new Map(teams.map(t => [t.id, t]));

      const standings: StandingEntry[] = data.standings.map((s: any) => ({
        ...s,
        team: teamMap.get(s.teamId) || teams[0] // Fallback
      }));

      const matches: Match[] = data.matches.map((m: any) => ({
        ...m,
        homeTeam: teamMap.get(m.homeTeamId) || teams[0],
        awayTeam: teamMap.get(m.awayTeamId) || teams[1]
      }));

      return {
        teams,
        initialStandings: standings,
        matches,
        currentRound: data.currentRound,
        season: data.season,
        isDemo: false,
        dataSource: DataSource.AI_SMART_SEARCH
      };

    } catch (error) {
      console.error("Smart Search failed:", error);
      return null;
    }
  }
}
