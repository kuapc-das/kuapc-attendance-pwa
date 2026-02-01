import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface LoginProps {
  onLogin: (token: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  const [vtoken, setVtoken] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsIOS(iOS && !isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vtoken.trim()) {
      onLogin(vtoken);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden supports-[height:100cqh]:min-h-[100cqh]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900 to-blue-800 rounded-b-[40px] shadow-lg z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10 mt-12 border border-blue-50 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center p-1 mb-4 border-2 border-blue-100">
             <img 
               src="https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png" 
               alt="KUAPC Logo" 
               className="h-full w-full object-contain rounded-full"
             />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center">KUAPC Digital Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Volunteer Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="vtoken" className="block text-sm font-medium text-slate-700 mb-2">
              Volunteer Token
            </label>
            <input
              id="vtoken"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={vtoken}
              onChange={(e) => setVtoken(e.target.value)}
              placeholder="Enter your V-Token"
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-400 ${
                error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-600'
              }`}
              disabled={isLoading}
              required
            />
            {isLoading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 font-medium animate-pulse">
                 <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Securely validating token with KUAPC server...
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 font-bold mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Authentication Failed
              </div>
              <p className="opacity-90">{error}</p>
            </div>
          )}

          <Button type="submit" isLoading={isLoading} loadingText="Verifying Token...">
            Verify & Proceed
          </Button>
        </form>
        
        {/* Android / Desktop Install */}
        {deferredPrompt && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button 
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 text-blue-900 bg-blue-50 hover:bg-blue-100 py-3 rounded-lg font-semibold transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install App on Device
            </button>
          </div>
        )}

        {/* iOS Install Instructions */}
        {isIOS && (
          <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
               <p className="font-semibold mb-2 flex items-center gap-2">
                 <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.58-.69.8-1.27 2.07-1.11 3.15 1.19.09 2.38-.79 3.1-1.62z"/>
                 </svg>
                 Install for iPhone/iPad
               </p>
               <ol className="list-decimal list-inside space-y-1 ml-1">
                 <li>Tap the <strong className="text-blue-700">Share</strong> button below.</li>
                 <li>Scroll down and tap <strong className="text-blue-700">Add to Home Screen</strong>.</li>
               </ol>
             </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Protected System. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};