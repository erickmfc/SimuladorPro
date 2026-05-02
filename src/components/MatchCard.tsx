import React from "react";
import { Team } from "../types";
import { motion } from "motion/react";
import { Shield, RotateCcw, Trophy } from "lucide-react";
import { cn } from "../lib/utils";
import { TeamLogo } from "./TeamLogo";

interface Props {
  home: Team;
  away: Team;
  homeScore: number | "";
  awayScore: number | "";
  status: "pending" | "finished" | "simulated";
  date: string;
  isHighlighted?: boolean;
  onScoreChange: (type: "home" | "away", value: string) => void;
  onQuickSelect: (result: "1" | "X" | "2") => void;
  onClear: () => void;
}

export const MatchCard: React.FC<Props> = ({ 
  home, 
  away, 
  homeScore, 
  awayScore, 
  status,
  date,
  isHighlighted,
  onScoreChange,
  onQuickSelect,
  onClear
}) => {
  const isSimulated = homeScore !== "" && awayScore !== "";

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex flex-col p-5 border transition-all mb-4 rounded-2xl",
        isHighlighted 
          ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
          : "bg-card-bg/40 hover:bg-card-bg/70 border-border-slate/50 hover:border-emerald-500/30"
      )}
    >
      {/* Row 1: The Matchup & Brackets Score */}
      <div className="flex items-center justify-between w-full mb-5 gap-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <TeamLogo name={home.name} logoUrl={home.logo} size="md" className="bg-slate-900 border border-border-slate/30 p-1 shadow-inner" />
          <span className="text-sm font-black text-slate-200 uppercase tracking-tighter truncate">{home.name}</span>
        </div>

        {/* Central Brackets Score */}
        <div className="flex items-center gap-4">
          <div className="relative group/input">
            <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <input 
              type="number" 
              placeholder="0"
              value={homeScore}
              disabled={status === "finished"}
              onChange={(e) => onScoreChange("home", e.target.value)}
              className="relative w-14 h-14 bg-slate-950 border-2 border-border-slate/50 rounded-xl text-center text-2xl font-black text-white focus:border-emerald-500 transition-all outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <span className="text-slate-600 font-black text-xl italic uppercase">x</span>

          <div className="relative group/input">
            <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
            <input 
              type="number" 
              placeholder="0"
              value={awayScore}
              disabled={status === "finished"}
              onChange={(e) => onScoreChange("away", e.target.value)}
              className="relative w-14 h-14 bg-slate-950 border-2 border-border-slate/50 rounded-xl text-center text-2xl font-black text-white focus:border-emerald-500 transition-all outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
          <span className="text-sm font-black text-slate-200 uppercase tracking-tighter truncate">{away.name}</span>
          <TeamLogo name={away.name} logoUrl={away.logo} size="md" className="bg-slate-900 border border-border-slate/30 p-1 shadow-inner" />
        </div>
      </div>

      {/* Row 2: Controls, Status & Clear */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          {status !== "finished" && (
            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-white/5">
              <button 
                onClick={() => onQuickSelect("1")}
                className="w-10 h-8 flex items-center justify-center rounded-lg text-xs font-black text-slate-500 hover:bg-emerald-500 hover:text-white transition-all"
              >1</button>
              <button 
                onClick={() => onQuickSelect("X")}
                className="w-10 h-8 flex items-center justify-center rounded-lg text-xs font-black text-slate-500 hover:bg-slate-700 hover:text-white transition-all"
              >X</button>
              <button 
                onClick={() => onQuickSelect("2")}
                className="w-10 h-8 flex items-center justify-center rounded-lg text-xs font-black text-slate-500 hover:bg-indigo-500 hover:text-white transition-all"
              >2</button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
              status === "finished" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              isSimulated ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              "bg-slate-800 text-slate-500 border border-slate-700"
            )}>
              {status === "finished" ? "Encerrado" : isSimulated ? "Simulado" : "Pendente"}
            </div>
            {isSimulated && status !== "finished" && <Shield size={12} className="text-emerald-400" />}
            <span className="text-[10px] font-bold text-slate-500 ml-1">{formatDate(date)}</span>
          </div>
        </div>

        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all uppercase tracking-widest group/clear"
        >
          <RotateCcw size={14} className="group-hover/clear:rotate-[-90deg] transition-transform" />
          Limpar
        </button>
      </div>
    </motion.div>
  );
};
