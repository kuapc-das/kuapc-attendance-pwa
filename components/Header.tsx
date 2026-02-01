import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  vtoken: string;
  pendingCount?: number;
  isOnline?: boolean;
  onOpenOfflineManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  vtoken, 
  pendingCount = 0, 
  isOnline = true,
  onOpenOfflineManager
}) => {
  return (
    <header className="bg-[#0f172a] border-b border-slate-800/60 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xl backdrop-blur-xl bg-opacity-95">
      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-xl shadow-lg ring-1 ring-white/20 overflow-hidden">
          <img 
            src="https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/new-icon-pwa.png" 
            alt="KUAPC" 
            className="h-6 w-6"
          />
        </div>
        <div className="flex flex-col">
           <h1 className="text-[12px] font-black text-white tracking-[0.2em] leading-none mb-1.5 uppercase">KUAPC DAS</h1>
           <div className="flex items-center gap-2.5">
             <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'}`}></span>
                <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">
                  {isOnline ? 'System Live' : 'Offline Mode'}
                </p>
             </div>
             {pendingCount > 0 && (
               <button 
                onClick={onOpenOfflineManager}
                className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-500/20 transition-all active:scale-90"
               >
                 <span className="text-[9px] text-amber-500 font-black">{pendingCount}</span>
               </button>
             )}
           </div>
        </div>
      </div>
      
      <button 
        onClick={onLogout}
        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-red-500/10 border border-slate-700/50 transition-all active:scale-95"
      >
        <span className="text-[10px] font-black text-slate-400 group-hover:text-red-400 uppercase tracking-[0.1em]">Exit</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
        </svg>
      </button>
    </header>
  );
};