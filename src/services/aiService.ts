import { GoogleGenAI, Type } from "@google/genai";

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
}

export interface OrchestratedBanner {
  banners: BannerData[];
  reviewNotes: string;
  patternStatus: "verified" | "rejected";
}

export class AIService {
  /**
   * Orchestrates the three-agent flow for multiple banners:
   * 1. Creation Agent
   * 2. Review Agent
   * 3. Pattern/Visual Agent
   */
  static async getMultiAgentBanners(round: number): Promise<BannerData[]> {
    // Stage 1: Creation Agent
    const creatorResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[CREATE AGENT] Identifique os 3 jogos mais importantes da rodada ${round} do Brasileirão 2026.
      Pesquise no Google Search por notícias no GE. 
      Crie 3 objetos de banner com títulos impactantes e análises técnicas.`,
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
                  gameId: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const rawBanners = JSON.parse(creatorResponse.text).banners as BannerData[];

    // Stage 2: Review Agent
    const reviewResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `[REVIEW AGENT] Revise estes 3 banners de futebol: ${JSON.stringify(rawBanners)}.
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
                  gameId: { type: Type.NUMBER }
                }
              } 
            },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    const reviewedBanners = JSON.parse(reviewResponse.text).reviewedBanners as BannerData[];

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
                  gameId: { type: Type.NUMBER }
                }
              } 
            },
            patternStatus: { type: Type.STRING, enum: ["verified", "rejected"] }
          }
        }
      }
    });

    const finalResult = JSON.parse(patternResponse.text);
    return finalResult.finalBanners as BannerData[];
  }

  /**
   * Orchestrates the three-agent flow: Veracity -> Analysis -> Update/Display
   */
  static async orchestrateMatchContext(matchDescription: string): Promise<{ veracity: VeracityReport, analysis: MatchAnalysis }> {
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

    const veracity = JSON.parse(veracityResponse.text) as VeracityReport;

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

    const analysis = JSON.parse(analysisResponse.text) as MatchAnalysis;

    return { veracity, analysis };
  }

  static async getFeaturedBanner(round: number): Promise<BannerData> {
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
            gameId: { type: Type.NUMBER }
          },
          required: ["title", "subtitle", "matchInfo", "analysisSummary", "callToAction"]
        }
      }
    });

    return JSON.parse(featuredResponse.text) as BannerData;
  }

  static async checkMatchSchedule(currentSchedule: any[]): Promise<{ updatedSchedule: any[], changesFound: boolean }> {
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

    const result = JSON.parse(checkResponse.text);
    if (!result.changesFound) return { updatedSchedule: currentSchedule, changesFound: false };

    const updated = currentSchedule.map(m => {
      const change = result.updatedSchedule.find((c: any) => c.id === m.id);
      return change ? { ...m, date: change.newDate } : m;
    });

    return { updatedSchedule: updated, changesFound: true };
  }
}
