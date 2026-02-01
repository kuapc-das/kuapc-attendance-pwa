import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface LoginProps {
  onLogin: (token: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  const [vtoken, setVtoken] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsIOS(iOS && !isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vtoken.trim()) {
      onLogin(vtoken);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
      {/* Premium Branded Header Background */}
      <div className="absolute top-0 left-0 w-full h-[38%] bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] rounded-b-[64px] shadow-2xl z-0 border-b-4 border-blue-400/20"></div>
      
      <div className="w-full max-w-[360px] bg-white rounded-[48px] shadow-2xl shadow-blue-900/10 p-10 z-10 border border-slate-100 animate-fade-in ring-1 ring-black/5">
        <div className="flex flex-col items-center mb-10">
          <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 ring-4 ring-slate-50 border border-slate-100 overflow-hidden">
             <img 
               src="https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png" 
               alt="KUAPC" 
               className="w-full h-full object-cover"
             />
          </div>
          <h1 className="text-3xl font-black text-slate-900 text-center tracking-tighter uppercase mb-1">KUAPC</h1>
          <div className="bg-blue-50 px-4 py-1 rounded-full border border-blue-100/50">
            <p className="text-[#1e3a8a] text-[9px] font-black tracking-[0.2em] uppercase">Digital Attendance System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <label htmlFor="vtoken" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">
              Volunteer Access Key
            </label>
            <input
              id="vtoken"
              type="text"
              autoComplete="off"
              value={vtoken}
              onChange={(e) => setVtoken(e.target.value)}
              placeholder="V-TOKEN"
              className={`w-full px-6 py-4.5 rounded-3xl border-2 focus:ring-8 focus:ring-blue-50 focus:border-[#1e3a8a] outline-none transition-all text-sm text-slate-800 font-bold placeholder-slate-300 shadow-sm ${
                error ? 'border-red-100 bg-red-50/20' : 'border-slate-50 bg-slate-50/50'
              }`}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-900 text-[11px] rounded-r-2xl font-bold shadow-sm animate-fade-in leading-relaxed">
              <span className="block uppercase tracking-wider mb-0.5">Authentication Failed</span>
              <span className="opacity-70 font-medium">{error}</span>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} loadingText="Authorizing..." className="py-5">
            Access Terminal
          </Button>
        </form>
        
        {(deferredPrompt || isIOS) && (
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install Application
              </button>
            )}
            {isIOS && (
              <div className="bg-slate-50 p-4 rounded-3xl text-[10px] text-slate-500 border border-slate-100 font-medium leading-relaxed">
                <span className="text-[#1e3a8a] font-black uppercase tracking-wider block mb-1">iOS Setup</span>
                Tap 'Share' then 'Add to Home Screen' to install.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};