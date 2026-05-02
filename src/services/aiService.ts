import { GoogleGenAI, Type } from "@google/genai";
import { BANNER_FALLBACKS } from "../data/fallback";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VeracityReport {
  isReal: boolean;
  confidence: number;
  source: string;
  notes: string;
}

export interface MatchAnalysis {
  matchId: number;
  prediction: string;
  keyPlayers: string[];
  tacticalInsight: string;
  recentNews: string;
}

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

export interface OrchestratedBanner {
  banners: BannerData[];
  reviewNotes: string;
  patternStatus: "verified" | "rejected";
}

export class AIService {
  private static lastQuotaError: number = 0;
  private static lastCallTime: number = 0;
  private static readonly CIRCUIT_BREAKER_DURATION = 900000; // 15 minutes increase
  private static readonly MIN_CALL_INTERVAL = 30000; // 30 seconds between ANY AI call
  private static activeRequests = new Map<string, Promise<any>>();
  private static lastAgentCallSucceeded: boolean = true;

  private static isCircuitOpen(): boolean {
    if (this.lastQuotaError === 0) return false;
    const now = Date.now();
    if (now - this.lastQuotaError > this.CIRCUIT_BREAKER_DURATION) {
      this.lastQuotaError = 0;
      return false;
    }
    return true;
  }

  private static canMakeCall(): boolean {
    const now = Date.now();
    if (this.isCircuitOpen()) return false;
    if (now - this.lastCallTime < this.MIN_CALL_INTERVAL) return false;
    return true;
  }

  private static handleAIError(error: any): void {
    this.lastAgentCallSucceeded = false;
    const errorStr = JSON.stringify(error);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
      this.lastQuotaError = Date.now();
    }
    // console.error("AI Service Error:", error); // Reduce noise
  }

  static getStatus(): { isCircuitOpen: boolean, lastQuotaError: number } {
    return { 
      isCircuitOpen: this.isCircuitOpen(), 
      lastQuotaError: this.lastQuotaError 
    };
  }

  private static safeParseJSON(text: string): any {
    if (!text || typeof text !== "string") return {};
    
    // Explicitly check for raw rate limit text before cleaning
    if (text.toLowerCase().includes("rate exceeded") || text.toLowerCase().includes("quota exceeded")) {
      this.lastQuotaError = Date.now();
      throw new Error("AI_QUOTA_EXCEEDED");
    }

    try {
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      // If it fails to parse but looks like it might be a text error message
      if (text.length < 500 && (text.includes("429") || text.includes("limit"))) {
        this.lastQuotaError = Date.now();
        throw new Error("AI_QUOTA_EXCEEDED_UNPARSABLE");
      }
      throw new Error(`Invalid JSON from AI: ${text.substring(0, 100)}...`);
    }
  }

  private static cacheKey(method: string, params: any): string {
    return `ai_cache_v2_${method}_${JSON.stringify(params)}`;
  }

  private static getFromCache(key: string): any | null {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache expiration: 6 hours
      if (Date.now() - timestamp > 21600000) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  private static setToCache(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  }

  static async getMultiAgentBanners(round: number, force: boolean = false): Promise<BannerData[]> {
    const key = this.cacheKey("getMultiAgentBanners", { round });
    const cached = this.getFromCache(key);
    if (cached && !force) return cached;

    if (!force && !this.canMakeCall()) {
      return BANNER_FALLBACKS;
    }

    if (this.activeRequests.has(key)) return this.activeRequests.get(key);

    const promise = (async () => {
      this.lastCallTime = Date.now();
      this.lastAgentCallSucceeded = true;
      try {
        if (this.isCircuitOpen()) throw new Error("AI_CIRCUIT_OPEN");

        // Stage 1: Creation Agent
        const creatorResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `[CREATE AGENT] Crie 4 banners de destaque para a rodada ${round} do Brasileirão 2026.
          FOCO OBRIGATÓRIO nestes times: Mirassol, Remo, Chapecoense e RB Bragantino.
          Pesquise no Google Search por notícias recentes sobre eles no GE. 
          Crie objetos de banner com títulos impactantes e análises técnicas para jogos envolvendo estes 4 times.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                banners: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      matchInfo: { type: Type.STRING },
                      analysisSummary: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      gameId: { type: Type.NUMBER },
                      homeTeamName: { type: Type.STRING },
                      awayTeamName: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        const rawBanners = this.safeParseJSON(creatorResponse.text).banners as BannerData[];
        if (this.isCircuitOpen() || !this.lastAgentCallSucceeded) return BANNER_FALLBACKS;

        // Stage 2: Review Agent
        const reviewResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `[REVIEW AGENT] Revise estes banners de futebol: ${JSON.stringify(rawBanners)}.
          Verifique se os dados são reais (ge.globo.com). Melhore os textos para que sejam mais autorais e profissionais.
          Corrija qualquer erro de data ou time.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reviewedBanners: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      matchInfo: { type: Type.STRING },
                      analysisSummary: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      gameId: { type: Type.NUMBER },
                      homeTeamName: { type: Type.STRING },
                      awayTeamName: { type: Type.STRING }
                    }
                  } 
                },
                notes: { type: Type.STRING }
              }
            }
          }
        });

        const reviewedBanners = this.safeParseJSON(reviewResponse.text).reviewedBanners as BannerData[];
        if (this.isCircuitOpen() || !this.lastAgentCallSucceeded) return BANNER_FALLBACKS;

        // Stage 3: Pattern/Image Analysis Agent
        const patternResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `[PATTERN AGENT] Analise o padrão visual e de dados destes banners finais: ${JSON.stringify(reviewedBanners)}.
          Certifique-se de que o tom de voz está consistente e que não há placeholders.
          Valide se o 'matchInfo' segue o padrão 'DIA, DD/MM/AAAA ÀS HH:mm - ESTÁDIO, UF'.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                finalBanners: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      matchInfo: { type: Type.STRING },
                      analysisSummary: { type: Type.STRING },
                      callToAction: { type: Type.STRING },
                      gameId: { type: Type.NUMBER },
                      homeTeamName: { type: Type.STRING },
                      awayTeamName: { type: Type.STRING }
                    }
                  } 
                },
                patternStatus: { type: Type.STRING, enum: ["verified", "rejected"] }
              }
            }
          }
        });

        const finalResult = this.safeParseJSON(patternResponse.text);
        const result = finalResult.finalBanners as BannerData[];
        this.setToCache(key, result);
        return result;
      } catch (error) {
        this.handleAIError(error);
        return BANNER_FALLBACKS;
      } finally {
        this.activeRequests.delete(key);
      }
    })();

    this.activeRequests.set(key, promise);
    return promise;
  }

  /**
   * Orchestrates the three-agent flow: Veracity -> Analysis -> Update/Display
   */
  static async orchestrateMatchContext(matchDescription: string, force: boolean = false): Promise<{ veracity: VeracityReport, analysis: MatchAnalysis }> {
    const key = this.cacheKey("orchestrateMatchContext", { matchDescription });
    const cached = this.getFromCache(key);
    if (cached && !force) return cached;

    const fallback = {
      veracity: { isReal: true, confidence: 1, source: "Cache Local", notes: "Dados em cache ou fallback." },
      analysis: { 
        matchId: 0, 
        prediction: "Análise baseada em dados históricos locais.", 
        keyPlayers: ["Destaques Locais"], 
        tacticalInsight: "Postura equilibrada esperada.", 
        recentNews: "Acompanhe as notícias no GE para mais detalhes." 
      }
    };

    if (!force && !this.canMakeCall()) return fallback;
    if (this.activeRequests.has(key)) return this.activeRequests.get(key);

    const promise = (async () => {
      this.lastCallTime = Date.now();
      try {
        // Stage 1: Veracity Agent (Using Search Grounding)
        const veracityResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Verifique a veracidade das seguintes informações sobre este jogo de futebol: ${matchDescription}. 
          Confirme datas, locais e se o jogo está confirmado de acordo com as fontes oficiais (GE, CBF).
          Não aceite dados simulados ou fakes se eles contradizem a realidade.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isReal: { type: Type.BOOLEAN },
                confidence: { type: Type.NUMBER },
                source: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ["isReal", "confidence", "source", "notes"]
            }
          }
        });

        const veracity = this.safeParseJSON(veracityResponse.text) as VeracityReport;

        // Stage 2: Analysis Agent
        const analysisResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Com base nas informações verificadas (${veracity.notes}), faça uma análise técnica profunda.
          Inclua palpites baseados em estatísticas reais, jogadores chave no GE, e insights táticos.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchId: { type: Type.NUMBER },
                prediction: { type: Type.STRING },
                keyPlayers: { type: Type.ARRAY, items: { type: Type.STRING } },
                tacticalInsight: { type: Type.STRING },
                recentNews: { type: Type.STRING }
              },
              required: ["prediction", "keyPlayers", "tacticalInsight", "recentNews"]
            }
          }
        });

        const analysis = this.safeParseJSON(analysisResponse.text) as MatchAnalysis;
        const result = { veracity, analysis };
        this.setToCache(key, result);
        return result;
      } catch (error) {
        this.handleAIError(error);
        return fallback;
      } finally {
        this.activeRequests.delete(key);
      }
    })();

    this.activeRequests.set(key, promise);
    return promise;
  }

  static async getFeaturedBanner(round: number, force: boolean = false): Promise<BannerData> {
    const key = this.cacheKey("getFeaturedBanner", { round });
    const cached = this.getFromCache(key);
    if (cached && !force) return cached;

    if (!force && !this.canMakeCall()) return BANNER_FALLBACKS[0];
    if (this.activeRequests.has(key)) return this.activeRequests.get(key);

    const promise = (async () => {
      this.lastCallTime = Date.now();
      try {
        const featuredResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Identifique o maior jogo da rodada ${round} do Brasileirão Série A 2026. 
          Use o Google Search para encontrar notícias recentes no GE (ge.globo.com).
          Crie um conteúdo autoral e impactante para um banner interativo.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                matchInfo: { type: Type.STRING },
                analysisSummary: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                gameId: { type: Type.NUMBER },
                homeTeamName: { type: Type.STRING },
                awayTeamName: { type: Type.STRING }
              },
              required: ["title", "subtitle", "matchInfo", "analysisSummary", "callToAction"]
            }
          }
        });

        const result = this.safeParseJSON(featuredResponse.text) as BannerData;
        this.setToCache(key, result);
        return result;
      } catch (error) {
        this.handleAIError(error);
        return BANNER_FALLBACKS[0];
      } finally {
        this.activeRequests.delete(key);
      }
    })();

    this.activeRequests.set(key, promise);
    return promise;
  }

  static async checkMatchSchedule(currentSchedule: any[], force: boolean = false): Promise<{ updatedSchedule: any[], changesFound: boolean }> {
    const key = this.cacheKey("checkMatchSchedule", { currentSchedule: currentSchedule.map(s => s.id) });
    const cached = this.getFromCache(key);
    if (cached && !force) return cached;
    
    if (!force && !this.canMakeCall()) return { updatedSchedule: currentSchedule, changesFound: false };
    if (this.activeRequests.has(key)) return this.activeRequests.get(key);

    const promise = (async () => {
      this.lastCallTime = Date.now();
      try {
        const checkResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analise as datas de jogos abaixo e verifique se houve mudanças no calendário real (GE/CBF) para 2026.
          Schedule atual: ${JSON.stringify(currentSchedule)}`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                updatedSchedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.NUMBER }, newDate: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                changesFound: { type: Type.BOOLEAN }
              },
              required: ["changesFound"]
            }
          }
        });

        const result = this.safeParseJSON(checkResponse.text);
        let finalResult = { updatedSchedule: currentSchedule, changesFound: false };
        if (result.changesFound) {
          const updated = currentSchedule.map(m => {
            const change = result.updatedSchedule.find((c: any) => c.id === m.id);
            return change ? { ...m, date: change.newDate } : m;
          });
          finalResult = { updatedSchedule: updated, changesFound: true };
        }
        this.setToCache(key, finalResult);
        return finalResult;
      } catch (error) {
        this.handleAIError(error);
        return { updatedSchedule: currentSchedule, changesFound: false };
      } finally {
        this.activeRequests.delete(key);
      }
    })();

    this.activeRequests.set(key, promise);
    return promise;
  }

  static async verifyTopPlayers(players: any[], competition: string, force: boolean = false): Promise<any[]> {
    const key = this.cacheKey("verifyTopPlayers", { players: players.map(p => p.player.id), competition });
    const cached = this.getFromCache(key);
    if (cached && !force) return cached;

    if (!force && !this.canMakeCall()) return players;
    if (this.activeRequests.has(key)) return this.activeRequests.get(key);

    const promise = (async () => {
      this.lastCallTime = Date.now();
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analise a lista de jogadores de ${competition} 2026.
          Verifique se estes jogadores ainda estão nos times listados ou se foram transferidos.
          Jogadores: ${JSON.stringify(players.map(p => ({ name: p.player.name, team: p.statistics[0].team.name })))}
          Use o Google Search para confirmar transferências recentes no GE de 2026.
          Retorne a lista corrigida com os times atuais.`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                corrigidos: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      currentTeam: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        const data = this.safeParseJSON(response.text);
        const verified = players.map(p => {
          const correction = data.corrigidos.find((c: any) => c.name === p.player.name);
          if (correction) {
            return {
              ...p,
              statistics: [
                {
                  ...p.statistics[0],
                  team: {
                    ...p.statistics[0].team,
                    name: correction.currentTeam
                  }
                }
              ]
            };
          }
          return p;
        });
        this.setToCache(key, verified);
        return verified;
      } catch (e) {
        this.handleAIError(e);
        return players;
      } finally {
        this.activeRequests.delete(key);
      }
    })();

    this.activeRequests.set(key, promise);
    return promise;
  }
}
