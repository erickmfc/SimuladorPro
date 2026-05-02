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
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [competition, activeRound]);

  // Real-time AI Plugin: Updates scorers/assists every 20 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsAIUpdating(true);
      try {
        // Simulate "Google IA Search" refreshing live data
        const [scorersData, assistsData] = await Promise.all([
          FootballService.getTopScorers(competition, 2024),
          FootballService.getTopAssists(competition, 2024)
        ]);
        
        // Add artificial delay for that "AI is thinking" feel
        setTimeout(() => {
          setScorers(scorersData);
          setAssists(assistsData);
          setIsAIUpdating(false);
        }, 2000);
      } catch (e) {
        console.error("AI Plugin Update Failed", e);
        setIsAIUpdating(false);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [competition]);

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
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <div className={cn("w-2 h-2 rounded-full", isAIUpdating ? "bg-indigo-400 animate-ping" : "bg-indigo-500")} />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Google IA Plugin</span>
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
        <main className="flex-1 overflow-y-auto no-scrollbar p-8 bg-app-bg">
          {/* Featured Banner Card */}
          {featuredMatch && (
            <section className="relative h-[340px] rounded-3xl overflow-hidden mb-8 border border-white/5 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-bet-blue via-indigo-900 to-slate-900"></div>
              <div className="absolute top-0 right-0 h-full w-1/2 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover opacity-60 scale-110 group-hover:scale-100 transition-transform duration-1000" 
                  alt="" 
                />
              </div>
              <div className="relative z-10 p-12 h-full flex flex-col justify-center max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center p-2">
                    <TeamLogo name={featuredMatch.homeTeam.name} logoUrl={featuredMatch.homeTeam.logo} size="lg" />
                  </div>
                  <span className="text-white text-xs font-black uppercase">vs</span>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center p-2">
                    <TeamLogo name={featuredMatch.awayTeam.name} logoUrl={featuredMatch.awayTeam.logo} size="lg" />
                  </div>
                  <div className="ml-4 glass-pill flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Hoje, 21:00
                  </div>
                </div>
                <h2 className="text-4xl font-black text-white leading-[0.9] mb-4 uppercase tracking-tighter">
                  {featuredMatch.homeTeam.name} <br/> vs {featuredMatch.awayTeam.name}
                </h2>
                {/* Data Source Badge */}
                <div className="flex items-center gap-2 mt-4">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    dataSource === DataSource.REAL ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    dataSource === DataSource.ALTERNATIVE ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    <Database size={12} />
                    {dataSource === DataSource.REAL ? "Dados Reais" : 
                     dataSource === DataSource.ALTERNATIVE ? "Dados Alternativos" : 
                     dataSource === DataSource.AI_SMART_SEARCH ? "Google IA Search" : "Modo Demo"}
                  </div>
                </div>

                {/* AI Source Warning */}
                {dataSource === DataSource.AI_SMART_SEARCH && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mt-4"
                  >
                    <Sparkles size={16} className="text-indigo-400 shrink-0" />
                    <p className="text-[10px] text-indigo-200/90 font-medium">
                      Dados obtidos via Google Search e processados por IA para garantir a última rodada disponível.
                    </p>
                  </motion.div>
                )}

                {/* Fallback Warning */}
                {dataSource === DataSource.ALTERNATIVE && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mt-4"
                  >
                    <Info size={16} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-200/70 font-medium">
                      Dados alternativos usados porque a API principal falhou. Algumas informações podem estar ligeiramente defasadas.
                    </p>
                  </motion.div>
                )}

                <p className="text-white/60 text-sm mb-8 font-medium leading-relaxed">
                  As projeções de tabela são atualizadas em tempo real conforme você preenche os placares abaixo.
                </p>
              </div>
            </section>
          )}

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
                {isAIUpdating && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500/30 overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                    />
                  </div>
                )}
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
