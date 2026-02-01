import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  vtoken: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, vtoken }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 h-16 px-5 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-lg shadow-sm">
          <img 
            src="https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/icon-pwa.png" 
            alt="KUAPC" 
            className="h-6 w-6"
          />
        </div>
        <div className="flex flex-col">
           <h1 className="text-sm font-bold text-white tracking-wide leading-none mb-1">KUAPC</h1>
           <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
             <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">VOLUNTEER: {vtoken}</p>
           </div>
        </div>
      </div>
      
      <button 
        onClick={onLogout}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-800 transition-all duration-200"
      >
        <span className="text-xs font-medium text-slate-300 group-hover:text-red-400">Exit</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>
  );
};