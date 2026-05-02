import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Target, TrendingUp, LayoutDashboard } from "lucide-react";
import { BannerData } from "../services/aiService";
import { cn } from "../lib/utils";
import { TeamLogo } from "./TeamLogo";
import { BRASILEIRAO_TEAMS } from "../data/fallback";

interface Props {
  banners: BannerData[];
  loading: boolean;
}

export const FeaturedBanner: React.FC<Props> = ({ banners, loading }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const getTeamLogo = (name: string) => {
    if (!name) return "";
    const searchName = name.toLowerCase();
    const team = BRASILEIRAO_TEAMS.find(t => 
      t.name.toLowerCase().includes(searchName) || 
      searchName.includes(t.name.toLowerCase())
    );
    return team?.logo || "";
  };

  React.useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 10000); // Slightly slower for better readability
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full h-[450px] rounded-[3rem] bg-slate-900/50 border border-white/5 animate-pulse flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 rounded-full bg-bet-blue" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-4 h-4 rounded-full bg-bet-blue" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-4 h-4 rounded-full bg-bet-blue" />
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Sincronizando com GE.Globo</span>
      </div>
    );
  }

  if (banners.length === 0) return null;

  const data = banners[currentIndex];

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full h-auto min-h-[450px] lg:h-[500px] rounded-[3.5rem] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-[#020617]">
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-bet-blue/10 blur-[150px]" />
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px]" />
          </div>

          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative h-full flex flex-col lg:flex-row items-center gap-16 p-12 lg:p-20">
            {/* Left Content: Typography focus */}
            <div className="flex-[1.5] space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <div className="px-5 py-2 rounded-xl bg-bet-blue text-slate-950 flex items-center gap-2 shadow-lg shadow-bet-blue/20">
                  <Zap size={14} className="fill-slate-950" />
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none">AI Intelligence</span>
                </div>
                <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Target size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">GE Verified</span>
                </div>
              </motion.div>

              <div className="space-y-6 max-w-2xl">
                <h1 className="text-6xl lg:text-[110px] font-black text-white leading-[0.85] uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  {data.title}
                </h1>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-bet-blue/20 border border-bet-blue/30 rounded text-bet-blue text-[10px] font-black uppercase tracking-widest">
                       AGENDA CONFIRMADA
                    </div>
                    <span className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">{data.matchInfo}</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-16 bg-bet-blue mt-1 blur-[1px]" />
                    <p className="text-xl lg:text-3xl font-bold text-slate-400 uppercase tracking-tight leading-tight">
                      {data.analysisSummary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-6 bg-white text-slate-950 font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3"
                >
                  {data.callToAction}
                  <LayoutDashboard size={18} />
                </motion.button>
              </div>
            </div>

            {/* Right Content: Match Decoration */}
            <div className="flex-1 w-full lg:min-w-[450px] flex items-center justify-center lg:justify-end">
                <div className="relative z-10 flex flex-col items-center lg:items-end gap-12">
                   {/* Massive VS Graphic */}
                   <div className="relative flex items-center justify-center gap-12">
                      {/* Background "LIVE" Text requested */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none overflow-hidden">
                        <span className="text-[200px] font-black text-white leading-none tracking-tighter">LIVE</span>
                      </div>

                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-4 group/home">
                        <div className="w-36 h-36 rounded-full bg-slate-900 border-x-4 border-bet-blue/30 shadow-[0_0_80px_rgba(30,64,175,0.25)] relative overflow-hidden flex items-center justify-center p-8 group-hover/home:scale-110 transition-transform duration-500">
                          {data.homeTeamName && <TeamLogo name={data.homeTeamName} logoUrl={getTeamLogo(data.homeTeamName)} size="2xl" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/home:text-bet-blue transition-colors">
                          {data.homeTeamName}
                        </span>
                      </div>

                      {/* VS Separator */}
                      <div className="flex flex-col items-center justify-center translate-y-[2px]">
                        <span className="text-6xl font-black text-white/5 tracking-tighter drop-shadow-sm">VS</span>
                        <div className="w-0.5 h-16 bg-gradient-to-b from-transparent via-bet-blue/30 to-transparent" />
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-4 group/away">
                        <div className="w-36 h-36 rounded-full bg-slate-900 border-x-4 border-bet-blue/30 shadow-[0_0_80px_rgba(30,64,175,0.25)] relative overflow-hidden flex items-center justify-center p-8 group-hover/away:scale-110 transition-transform duration-500">
                          {data.awayTeamName && <TeamLogo name={data.awayTeamName} logoUrl={getTeamLogo(data.awayTeamName)} size="2xl" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover/away:text-bet-blue transition-colors">
                          {data.awayTeamName}
                        </span>
                      </div>
                   </div>
                </div>
            </div>
          </div>

          {/* Social Proof / Trust Indicators */}
          <div className="absolute bottom-12 left-20 hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Análise em Tempo Real</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Protocolo Multi-Agente v3.4</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-4">
              <TrendingUp size={16} className="text-bet-blue" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">+98% Precisão de Dados</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Circular Pagination */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {banners.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              currentIndex === idx ? "bg-bet-blue w-8" : "bg-white/20 w-1.5 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
};
