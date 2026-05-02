import React from "react";
import { Team, StandingEntry } from "../types";
import { cn } from "../lib/utils";
import { TeamLogo } from "./TeamLogo";

interface Props {
  data: StandingEntry[];
  round?: string;
  highlightedTeamIds?: number[];
}

export const StandingTable: React.FC<Props> = ({ data, round, highlightedTeamIds = [] }) => {
  const sortedData = [...data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="bg-card-bg/40 border border-border-slate rounded-3xl overflow-hidden flex flex-col">
      <div className="p-5 border-b border-border-slate bg-card-bg/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          Classificação
        </h3>
        {round && <span className="text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter">{round}</span>}
      </div>
      <div className="px-2 py-2 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-7 text-[9px] font-black text-slate-600 px-3 py-2 uppercase tracking-widest border-b border-border-slate/30 mb-2">
          <span className="col-span-4">Clube</span>
          <span className="text-center">P</span>
          <span className="text-center">J</span>
          <span className="text-center">SG</span>
        </div>
        <div className="space-y-1">
          {sortedData.map((entry, idx) => {
            const isHighlighted = highlightedTeamIds.includes(entry.team.id);
            return (
              <div 
                key={entry.team.id} 
                className={cn(
                  "grid grid-cols-7 items-center text-[10px] py-1 px-3 rounded-lg transition-all duration-300",
                  isHighlighted 
                    ? "bg-emerald-500/20 border-l-2 border-emerald-500 scale-[1.01] z-10 relative" 
                    : (idx === 0 ? "bg-bet-blue/10 border-l-2 border-bet-blue" : "bg-slate-900/40 border-l-2 border-transparent")
                )}
              >
                <div className="col-span-4 flex items-center gap-2">
                  <span className="w-3 font-mono text-[8px] text-slate-600">{idx + 1}</span>
                  <TeamLogo name={entry.team.name} logoUrl={entry.team.logo} size="xs" />
                  <span className={cn(
                    "font-bold uppercase tracking-tight truncate",
                    isHighlighted ? "text-emerald-400" : (idx === 0 ? "text-bet-blue" : "text-slate-300")
                  )}>
                    {entry.team.name}
                  </span>
                </div>
                <span className={cn("text-center font-black", isHighlighted ? "text-emerald-400" : "text-slate-100")}>{entry.points}</span>
                <span className="text-center font-bold text-slate-600">{entry.played}</span>
                <span className={cn(
                  "text-center font-black",
                  entry.goalsFor - entry.goalsAgainst >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {entry.goalsFor - entry.goalsAgainst}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
