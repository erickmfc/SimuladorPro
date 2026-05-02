import React, { useState } from "react";
import { Scorer, Player } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Star, Target, X, User, History, Shield, Zap, AlertTriangle, Eye } from "lucide-react";
import { cn } from "../lib/utils";
import { TeamLogo } from "./TeamLogo";
import { FootballService } from "../services/footballService";

interface Props {
  scorers: Scorer[];
  assists: Scorer[];
}

export const TopPlayers: React.FC<Props> = ({ scorers, assists }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Scorer | null>(null);
  const [extraStats, setExtraStats] = useState<any | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const topScorer = scorers[0];
  const topAssist = assists[0];

  const handlePlayerClick = (player: Scorer) => {
    setSelectedPlayer(player);
    setExtraStats(null); // Reset extra stats when new player is selected
  };

  const loadExtraStats = async () => {
    if (!selectedPlayer || loadingExtra || extraStats) return;
    
    setLoadingExtra(true);
    try {
      // Small simulation delay for "AI Research" feel
      await new Promise(resolve => setTimeout(resolve, 800));
      const stats = await FootballService.getPlayerStats(selectedPlayer.player.id, 2026);
      setExtraStats(stats);
    } catch (e) {
      console.error("Failed to load extra stats", e);
    } finally {
      setLoadingExtra(false);
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayer(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="relative h-32 bg-gradient-to-br from-bet-blue/40 to-indigo-600/40">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 shadow-xl flex items-center justify-center">
                    <User size={40} className="text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-6 text-center">
                <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{selectedPlayer.player.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <TeamLogo 
                    name={selectedPlayer.statistics[0].team.name} 
                    logoUrl={selectedPlayer.statistics[0].team.logo} 
                    size="sm" 
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {selectedPlayer.statistics[0].team.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <DetailItem icon={<History size={12} />} label="Idade" value={`${selectedPlayer.player.age} anos`} />
                  <DetailItem icon={<Shield size={12} />} label="Nacionalidade" value={selectedPlayer.player.nationality} />
                  <DetailItem icon={<Target size={12} />} label="Altura" value={selectedPlayer.player.height || "N/A"} />
                  <DetailItem icon={<User size={12} />} label="Peso" value={selectedPlayer.player.weight || "N/A"} />
                </div>

                {/* Lazy Loaded AI Insights/Stats */}
                {!extraStats && !loadingExtra && (
                  <button 
                    onClick={loadExtraStats}
                    className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl flex items-center justify-center gap-2 transition-all group"
                  >
                    <Eye size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Consultar Dados GE/IA</span>
                  </button>
                )}

                {loadingExtra && (
                  <div className="w-full py-3 bg-slate-950 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Cruzando Dados Live 2026</span>
                  </div>
                )}

                {extraStats && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-left space-y-4"
                  >
                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                      <Zap size={14} className="fill-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Relatório Técnico - GE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Passes Chave</p>
                        <p className="text-lg font-black text-white">{extraStats.statistics[0].passes.key || 0}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Precisão</p>
                        <p className="text-lg font-black text-white">{extraStats.statistics[0].passes.accuracy || 0}%</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-between p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={12} className="text-rose-400" />
                          <span className="text-[9px] font-black text-rose-400 uppercase">Cartões (Am/Vm)</span>
                        </div>
                        <span className="text-xs font-black text-white">
                          {extraStats.statistics[0].cards.yellow} / {extraStats.statistics[0].cards.red}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Featured AI Insights */}
      {(topScorer || topAssist) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Star size={14} className="text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Destaques IA :: Jun/2026</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {topScorer && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handlePlayerClick(topScorer)}
                className="relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden p-4 group cursor-pointer hover:border-emerald-500/30 transition-colors"
              >
                <div className="absolute top-0 right-0 p-2 opacity-50"><Trophy size={20} /></div>
                <div className="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-emerald-500/30 mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <User size={24} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white truncate px-1">{topScorer.player.name}</p>
                  <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{topScorer.statistics[0].goals.total} ARTILHEIRO</p>
                </div>
              </motion.div>
            )}

            {topAssist && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handlePlayerClick(topAssist)}
                className="relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden p-4 group cursor-pointer hover:border-indigo-500/30 transition-colors"
              >
                <div className="absolute top-0 right-0 p-2 opacity-50"><Star size={20} /></div>
                <div className="w-16 h-16 rounded-full mx-auto bg-slate-800 border-2 border-indigo-500/30 mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <User size={24} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white truncate px-1">{topAssist.player.name}</p>
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{topAssist.statistics[0].goals.assists} GARÇOM</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Top Scorers List */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Trophy size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Artilharia</h3>
        </div>

        <div className="space-y-2">
          {scorers.slice(0, 5).map((s, idx) => (
            <motion.div
              key={s.player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handlePlayerClick(s)}
              className="group flex items-center justify-between p-3 bg-slate-900/40 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 min-w-[20px]">{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 group-hover:border-emerald-500/50 transition-colors flex items-center justify-center">
                    <User size={20} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
                  </div>
                    <TeamLogo 
                      name={s.statistics[0].team.name} 
                      logoUrl={s.statistics[0].team.logo} 
                      size="sm" 
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border border-white/10 p-0.5" 
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{s.player.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">{s.statistics[0].team.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white">{s.statistics[0].goals.total}</span>
              </div>
            </motion.div>
          ))}
          {scorers.length === 0 && (
            <p className="text-[10px] text-slate-500 italic p-4 text-center bg-slate-900/20 rounded-xl border border-white/5">Artilharia indisponível</p>
          )}
        </div>
      </section>

      {/* Top Assists */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Star size={16} className="text-indigo-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Garçons</h3>
        </div>

        <div className="space-y-2">
          {assists.slice(0, 5).map((s, idx) => (
            <motion.div
              key={s.player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handlePlayerClick(s)}
              className="group flex items-center justify-between p-3 bg-slate-900/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 min-w-[20px]">{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 group-hover:border-indigo-500/50 transition-colors flex items-center justify-center">
                    <User size={20} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                  </div>
                    <TeamLogo 
                      name={s.statistics[0].team.name} 
                      logoUrl={s.statistics[0].team.logo} 
                      size="sm" 
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border border-white/10 p-0.5" 
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{s.player.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">{s.statistics[0].team.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-white">{s.statistics[0].goals.assists || 0}</span>
              </div>
            </motion.div>
          ))}
          {assists.length === 0 && (
            <p className="text-[10px] text-slate-500 italic p-4 text-center bg-slate-900/20 rounded-xl border border-white/5">Dados indisponíveis</p>
          )}
        </div>
      </section>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-left">
    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
      <span className="opacity-70">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xs font-bold text-white uppercase">{value}</p>
  </div>
);
