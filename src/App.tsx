/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { CompetitionSelector } from "./components/CompetitionSelector";
import { MatchCard } from "./components/MatchCard";
import { StandingTable } from "./components/StandingTable";
import { TopPlayers } from "./components/TopPlayers";
import { FootballService, CompetitionType, DataSource } from "./services/footballService";
import { getMatchesForRound } from "./data/schedule";
import { Team, Match, StandingEntry, Scorer } from "./types";
import { LayoutGrid, List, History, ChevronRight, Shield, Trophy, RotateCcw, Info, Database, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

import { TeamLogo } from "./components/TeamLogo";

import { FeaturedBanner } from "./components/FeaturedBanner";
import { AIService, BannerData } from "./services/aiService";

export default function App() {
  const [competition, setCompetition] = useState<CompetitionType>("brasileirao");
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState<string>("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.DEMO);
  const [initialStandings, setInitialStandings] = useState<StandingEntry[] | undefined>();
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [assists, setAssists] = useState<Scorer[]>([]);
  
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  const [matchStates, setMatchStates] = useState<Record<string, { homeScore: number | ""; awayScore: number | ""; status: "pending" | "simulated" | "finished" }>>(() => {
    try {
      const saved = localStorage.getItem('br-sim-states');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [activeRound, setActiveRound] = useState(14);
  const [focusedTeamIds, setFocusedTeamIds] = useState<number[]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isAIUpdating, setIsAIUpdating] = useState(false);
  const totalRounds = 38;

  // Persistence
  useEffect(() => {
    localStorage.setItem('br-sim-states', JSON.stringify(matchStates));
  }, [matchStates]);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const data = await FootballService.getCompetitionData(competition, activeRound);
        setTeams(data.teams);
        setMatches(data.matches); 
        setInitialStandings(data.initialStandings);
        setCurrentRound(data.currentRound || `${activeRound}ª Rodada`);
        setIsDemoMode(data.isDemo);
        setDataSource(data.dataSource);

        setMatchStates(prev => {
          const next = { ...prev };
          data.matches.forEach(m => {
            if (!next[m.id]) {
              next[m.id] = { 
                homeScore: m.homeScore ?? "", 
                awayScore: m.awayScore ?? "", 
                status: m.homeScore !== undefined ? "finished" : "pending" 
              };
            }
          });
          return next;
        });

        const [scorersData, assistsData] = await Promise.all([
          FootballService.getTopScorers(competition, data.season),
          FootballService.getTopAssists(competition, data.season)
        ]);
        setScorers(scorersData);
        setAssists(assistsData);

        // Load AI Multi-Agent Banners
        setBannerLoading(true);
        AIService.getMultiAgentBanners(activeRound).then(data => {
          setBanners(data);
          setBannerLoading(false);
        });

        // Check for schedule updates via IA
        AIService.checkMatchSchedule(data.matches).then(result => {
          if (result.changesFound) {
            setMatches(result.updatedSchedule);
            console.log("[AI Schedule] Datas atualizadas conforme GE/CBF.");
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [competition, activeRound]);

  // Real-time AI Plugin: Updates scorers/assists every 30 seconds using Multi-Agent Logic
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsAIUpdating(true);
      try {
        console.log(`[AI Orchestrator] Verifying data via Google IA Search...`);
        
        // Use the multi-agent orchestration for the first game to verify integrity
        if (matches.length > 0) {
          const context = `Match: ${matches[0].homeTeam.name} vs ${matches[0].awayTeam.name}, Date: ${matches[0].date}`;
          const report = await AIService.orchestrateMatchContext(context);
          console.log("[AI Veracity Report]", report.veracity);
        }

        const [scorersData, assistsData] = await Promise.all([
          FootballService.getTopScorers(competition, 2026),
          FootballService.getTopAssists(competition, 2026)
        ]);
        
        setScorers(scorersData);
        setAssists(assistsData);
        setIsAIUpdating(false);
      } catch (e) {
        console.error("AI Orchestrator Fail", e);
        setIsAIUpdating(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [competition, matches]);

  const handleScoreChange = (matchId: string, type: "home" | "away", value: string) => {
    const numValue = value === "" ? "" : parseInt(value);
    
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setFocusedTeamIds([match.homeTeam.id, match.awayTeam.id]);
    }

    setMatchStates(prev => {
      const current = prev[matchId] || { homeScore: "", awayScore: "", status: "pending" };
      let nextHome = type === "home" ? numValue : current.homeScore;
      let nextAway = type === "away" ? numValue : current.awayScore;
      
      if (nextHome !== "" && nextAway === "") nextAway = 0;
      if (nextAway !== "" && nextHome === "") nextHome = 0;
      
      return {
        ...prev,
        [matchId]: {
          homeScore: nextHome,
          awayScore: nextAway,
          status: (nextHome !== "" || nextAway !== "") ? "simulated" : "pending"
        }
      };
    });
  };

  const handleQuickSelect = (matchId: string, result: "1" | "X" | "2") => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setFocusedTeamIds([match.homeTeam.id, match.awayTeam.id]);
    }

    const resultScores = {
      "1": { home: 1, away: 0 },
      "X": { home: 1, away: 1 },
      "2": { home: 0, away: 1 }
    };
    setMatchStates(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        homeScore: resultScores[result].home,
        awayScore: resultScores[result].away,
        status: "simulated"
      }
    }));
  };

  const handleClearMatch = (matchId: string) => {
    setMatchStates(prev => ({
      ...prev,
      [matchId]: {
        homeScore: "",
        awayScore: "",
        status: "pending"
      }
    }));
  };

  const handleSimulateAll = () => {
    setMatchStates(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(id => {
        const state = newState[id];
        if (state.homeScore !== "" && state.awayScore !== "" && state.status !== "finished") {
          newState[id] = { ...state, status: "simulated" };
        }
      });
      return newState;
    });
  };

  const handleResetAll = () => {
    setMatchStates(prev => {
      const newState = { ...prev };
      matches.forEach(m => {
        newState[m.id] = {
          homeScore: m.homeScore ?? "",
          awayScore: m.awayScore ?? "",
          status: m.homeScore !== undefined ? "finished" : "pending"
        };
      });
      return newState;
    });
  };

  const handleNextRound = () => {
    if (activeRound < totalRounds) {
      setFocusedTeamIds([]);
      setActiveRound(prev => prev + 1);
    }
  };

  const handlePrevRound = () => {
    if (activeRound > 1) {
      setFocusedTeamIds([]);
      setActiveRound(prev => prev - 1);
    }
  };

  const standings = useMemo(() => {
    const stats: Record<number, StandingEntry> = {};
    
    if (initialStandings && initialStandings.length > 0) {
      initialStandings.forEach(s => {
        stats[s.team.id] = { ...s };
      });
    } else {
      teams.forEach(t => {
        stats[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0 };
      });
    }

    // Capture ALL matches that have been simulated, not just the active round ones
    Object.entries(matchStates).forEach(([matchId, state]) => {
      const s = state as { homeScore: number | ""; awayScore: number | ""; status: string };
      const { homeScore, awayScore } = s;
      
      if (homeScore === "" && awayScore === "") return;

      const hScore = homeScore === "" ? 0 : Number(homeScore);
      const aScore = awayScore === "" ? 0 : Number(awayScore);
      
      let match: Match | undefined;

      // 1. Check current round matches (fastest)
      match = matches.find(m => m.id === matchId);
      
      // 2. If not found, it's from another round. Resolve it using the schedule helper.
      if (!match && matchId.startsWith("round-")) {
        try {
          const parts = matchId.split("-");
          const rNum = parseInt(parts[1]);
          const mIdx = parseInt(parts[2]);
          const roundMatches = getMatchesForRound(rNum);
          match = roundMatches[mIdx];
        } catch (e) {
          // ignore parsing errors
        }
      }

      if (!match) return;

      const home = stats[match.homeTeam.id];
      const away = stats[match.awayTeam.id];
      if (!home || !away) return;
      
      home.played++; away.played++;
      home.goalsFor += hScore; home.goalsAgainst += aScore;
      away.goalsFor += aScore; away.goalsAgainst += hScore;
      if (hScore > aScore) { home.won++; home.points += 3; away.lost++; }
      else if (aScore > hScore) { away.won++; away.points += 3; home.lost++; }
      else { home.drawn++; away.drawn++; home.points += 1; away.points += 1; }
    });
    
    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const bGD = b.goalsFor - b.goalsAgainst;
      const aGD = a.goalsFor - a.goalsAgainst;
      if (bGD !== aGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });
  }, [matches, teams, matchStates, initialStandings]);

  const teamCountMismatch = competition === "brasileirao" && teams.length > 0 && teams.length !== 20;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (teamCountMismatch) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Shield size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Erro de Integridade</h1>
        <p className="text-slate-400 max-w-md">O Brasileirão Série A deve conter exatamente 20 times. Retornados: {teams.length}. Verifique a API ou a temporada selecionada.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-slate-900 border border-border-slate rounded-xl text-xs font-black uppercase text-white hover:bg-slate-800 transition-all">Recarregar</button>
      </div>
    );
  }

  const featuredMatch = matches[0];

  return (
    <div className="flex flex-col h-screen bg-app-bg text-slate-100 font-sans overflow-hidden">
      {/* Top Header Row */}
      <header className="h-16 border-b border-border-slate bg-sidebar-bg/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-bet-blue hover:text-white transition-all text-slate-400"
          >
            <List size={20} className={cn("transition-transform", isLeftSidebarOpen && "rotate-90")} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-bet-blue rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-bet-blue/20">
              SC
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Simulador <span className="text-bet-blue">Pro</span></h1>
          </div>
          
          <nav className="flex space-x-1 ml-6">
            <button 
              onClick={() => setCompetition("brasileirao")}
              className={cn("px-5 py-2 rounded-full text-xs font-bold transition-all", competition === "brasileirao" ? "bg-bet-blue text-white" : "text-slate-500 hover:text-white")}
            >
              Futebol
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 group relative cursor-help">
              <div className={cn("w-2 h-2 rounded-full", isAIUpdating ? "bg-emerald-400 animate-ping" : "bg-emerald-500")} />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Google IA Search</span>
              <div className="absolute top-full left-0 mt-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl">
                <p className="text-[9px] font-bold text-slate-300 leading-tight">Sincronizado com dados de 2026 via Globo Esporte (GE) e Google IA.</p>
              </div>
            </div>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black leading-none">Matheus FC</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Pro member</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden ring-2 ring-bet-blue/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
          <button 
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
            className={cn(
              "w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-slate-400",
              isRightSidebarOpen && "bg-emerald-500 text-white"
            )}
          >
            <Trophy size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {isLeftSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-sidebar-bg border-r border-border-slate flex flex-col p-6 shrink-0 overflow-y-auto no-scrollbar"
            >
              <SectionTitle>Ligas Populares</SectionTitle>
              <div className="space-y-1 mb-8">
                <LeagueItem label="Brasileirão Série A" icon={Shield} active={competition === "brasileirao"} onClick={() => setCompetition("brasileirao")} count={20} />
                <LeagueItem label="Copa do Mundo" icon={Trophy} active={competition === "worldcup"} onClick={() => setCompetition("worldcup")} count={32} />
                <LeagueItem label="Champions League" icon={History} disabled count={38} />
                <LeagueItem label="La Liga" icon={LayoutGrid} disabled count={156} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center Main Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-8 bg-app-bg space-y-12">
          {/* AI FeaturedBanner Carousel */}
          <div className="space-y-4">
            <FeaturedBanner banners={banners} loading={bannerLoading} />
            {banners.length > 0 && !bannerLoading && (
              <div className="flex justify-center">
                <div className="glass-pill px-6 py-2 flex items-center gap-4 bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Banners Online</span>
                  </div>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">5 Novos Agendados p/ Rodada Final</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Round Switcher / Match List Filters */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between p-1 bg-slate-900/80 border border-white/5 rounded-2xl">
              <button 
                onClick={handlePrevRound}
                disabled={activeRound <= 1}
                className="p-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white disabled:opacity-20"
              >
                <ChevronRight className="rotate-180" size={20} />
              </button>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
                {Array.from({ length: 5 }, (_, i) => activeRound - 2 + i)
                  .filter(r => r > 0 && r <= totalRounds)
                  .map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRound(r)}
                      className={cn(
                        "min-w-10 h-10 px-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center border uppercase tracking-widest",
                        r === activeRound 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                          : "bg-slate-950 border-white/5 text-slate-500 hover:border-white/10"
                      )}
                    >
                      {r}ª
                    </button>
                  ))
                }
              </div>

              <button 
                onClick={handleNextRound}
                disabled={activeRound >= totalRounds}
                className="p-3 rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-white disabled:opacity-20"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-border-slate pb-4">
              <div className="flex gap-4">
                  <button onClick={handleResetAll} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-border-slate rounded-xl text-[10px] font-black text-slate-500 hover:text-white transition-all">
                    <RotateCcw size={14} />
                    RESETAR TUDO
                  </button>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                 <History size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{activeRound}ª Rodada (Atual)</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
             {isLoading ? (
               Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 bg-card-bg/20 animate-pulse rounded-xl" />)
             ) : (
               matches.map(m => {
                 const state = matchStates[m.id] || { homeScore: "", awayScore: "", status: "pending" };
                 const isInteracted = state.homeScore !== "" || state.awayScore !== "";
                 return (
                   <MatchCard 
                      key={m.id} 
                      home={m.homeTeam} 
                      away={m.awayTeam} 
                      homeScore={state.homeScore} 
                      awayScore={state.awayScore} 
                      status={state.status}
                      date={m.date}
                      isHighlighted={isInteracted}
                      onScoreChange={(type, val) => handleScoreChange(m.id, type, val)}
                      onQuickSelect={(res) => handleQuickSelect(m.id, res)}
                      onClear={() => handleClearMatch(m.id)}
                   />
                 );
               })
             )}
          </div>
        </main>

        {/* Right Sidebar */}
        <AnimatePresence mode="wait">
          {isRightSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-sidebar-bg border-l border-border-slate flex flex-col pt-8 shrink-0 overflow-y-auto no-scrollbar overflow-x-hidden"
            >
              <div className="px-6">
                <SectionTitle>Classificação Geral</SectionTitle>
              </div>
              <div className="mb-10 px-4">
                <StandingTable data={standings} highlightedTeamIds={focusedTeamIds} />
              </div>

              <div className="mt-8 border-t border-border-slate pt-8 relative">
                <div className="px-6 mb-6">
                  <SectionTitle>Líderes de Estatísticas</SectionTitle>
                </div>
                <TopPlayers scorers={scorers} assists={assists} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <footer className="h-8 bg-sidebar-bg border-t border-border-slate px-6 flex items-center justify-between shrink-0">
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">© 2024 Simulator Pro System</span>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Real-time data enabled</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
      {children}
      <ChevronRight size={10} />
    </h3>
  );
}

function LeagueItem({ label, active, disabled, count, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
        active ? "bg-bet-blue/10 text-bet-blue border border-bet-blue/20" : "text-slate-400 hover:text-slate-200",
        disabled && "opacity-40 grayscale cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-lg transition-colors", active ? "bg-bet-blue text-white" : "bg-slate-800")}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-[10px] font-black opacity-30 group-hover:opacity-100 transition-opacity">{count}</span>
    </button>
  );
}

function CountryItem({ label, flag, count }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        <span className="text-xl">{flag}</span>
        <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
      </div>
      <span className="text-[10px] font-black text-slate-700">{count}</span>
    </div>
  );
}

function FilterTab({ label, active }: any) {
  return (
    <button className={cn(
      "text-[10px] font-black uppercase tracking-widest py-2 transition-all relative",
      active ? "text-white" : "text-slate-600 hover:text-slate-400"
    )}>
      {label}
      {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-bet-blue"></div>}
    </button>
  );
}
