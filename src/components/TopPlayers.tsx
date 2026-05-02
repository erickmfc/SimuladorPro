import React from "react";
import { Scorer } from "../types";
import { motion } from "motion/react";
import { Trophy, Star, Target } from "lucide-react";
import { cn } from "../lib/utils";
import { TeamLogo } from "./TeamLogo";

interface Props {
  scorers: Scorer[];
  assists: Scorer[];
}

export const TopPlayers: React.FC<Props> = ({ scorers, assists }) => {
  return (
    <div className="space-y-8">
      {/* Top Scorers */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Trophy size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Artilheiros</h3>
        </div>

        <div className="space-y-2">
          {scorers.slice(0, 5).map((s, idx) => (
            <motion.div
              key={s.player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-center justify-between p-3 bg-slate-900/40 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                    <img src={s.player.photo} alt={s.player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-white">{s.statistics[0].goals.total}</span>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Gols</span>
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
            <Target size={16} className="text-indigo-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Garis (Assistências)</h3>
        </div>

        <div className="space-y-2">
          {assists.slice(0, 5).map((s, idx) => (
            <motion.div
              key={s.player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex items-center justify-between p-3 bg-slate-900/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                    <img src={s.player.photo} alt={s.player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-white">{s.statistics[0].goals.assists || 0}</span>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Assists</span>
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
