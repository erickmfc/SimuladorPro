import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Target, TrendingUp, LayoutDashboard } from "lucide-react";
import { BannerData } from "../services/aiService";
import { cn } from "../lib/utils";

interface Props {
  banners: BannerData[];
  loading: boolean;
}

export const FeaturedBanner: React.FC<Props> = ({ banners, loading }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full h-80 rounded-[2.5rem] bg-slate-900/50 border border-white/5 animate-pulse flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 rounded-full bg-bet-blue" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 rounded-full bg-bet-blue" />
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 rounded-full bg-bet-blue" />
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">IA Processando Insights do GE</span>
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-auto min-h-[400px] lg:h-[450px] rounded-[3rem] overflow-hidden group shadow-2xl"
        >
          {/* Background with intelligent glow */}
          <div className="absolute inset-0 bg-slate-950">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-bet-blue/20 blur-[150px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Decorative AI Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative h-full flex flex-col lg:flex-row items-center gap-8 p-10 lg:p-16">
            <div className="flex-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="px-4 py-1.5 rounded-full bg-bet-blue/10 border border-bet-blue/20 flex items-center gap-2">
                  <Zap size={14} className="text-bet-blue fill-bet-blue" />
                  <span className="text-[10px] font-black text-bet-blue uppercase tracking-widest">Multi-Agent AI Analysis</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+92% Trust Score</span>
                </div>
              </motion.div>

              <div className="space-y-3">
                <h1 className="text-4xl lg:text-7xl font-black text-white leading-tight uppercase tracking-tighter">
                  {data.title}
                </h1>
                <p className="text-xl lg:text-2xl font-bold text-slate-400 uppercase tracking-tight">
                  {data.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                 <div className="p-4 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-sm max-w-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Target size={12} className="text-bet-blue" />
                      Revisão do Especialista (GE)
                    </p>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                      "{data.analysisSummary}"
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-bet-blue text-slate-950 font-black rounded-2xl flex items-center gap-3 shadow-lg shadow-bet-blue/20 uppercase tracking-widest text-sm"
                >
                  {data.callToAction}
                  <LayoutDashboard size={18} />
                </motion.button>
              </div>
            </div>

            {/* Visual Decoration for Match */}
            <div className="relative w-full lg:w-[400px] h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-bet-blue/20 to-transparent rounded-full blur-[100px] animate-pulse" />
                <div className="relative z-10 text-center space-y-4">
                   <div className="text-[120px] font-black text-white/5 uppercase tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                     LIVE
                   </div>
                   <p className="text-xs font-black text-bet-blue uppercase tracking-[0.4em]">{data.matchInfo}</p>
                   <div className="flex items-center justify-center gap-8">
                      <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      </div>
                      <span className="text-4xl font-black text-white/20">VS</span>
                      <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                      </div>
                   </div>
                </div>
            </div>
          </div>

          {/* Footer Meta */}
          <div className="absolute bottom-10 left-16 flex items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">Verificado por 3 Agentes IA</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentIndex === idx ? "bg-bet-blue w-6" : "bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
};
