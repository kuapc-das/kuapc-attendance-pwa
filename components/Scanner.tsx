import React, { useEffect, useState, useRef } from 'react';
import { Button } from './Button';
import { ScanResult, ScanStatus } from '../types';
import { Haptics } from '../utils/haptics';

declare const Html5Qrcode: any;

interface ScannerProps {
  onScan: (data: string) => void;
  result: ScanResult;
  onReset: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, result, onReset }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerId = "reader";

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerId);
    }
    if (scannerRef.current.isScanning) return;

    const config = {
      fps: 30,
      qrbox: (viewWidth: number, viewHeight: number) => {
        const size = Math.min(viewWidth, viewHeight) * 0.7;
        return { width: size, height: size };
      },
      aspectRatio: 1.0,
    };

    try {
      setCameraError(null);
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          // Visual and Haptic Feedback
          Haptics.success();
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 150);
          
          stopScanner();
          onScan(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err?.message || "Optical Kernel Error.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (result.status === ScanStatus.IDLE || result.status === ScanStatus.SCANNING) {
      startScanner();
    } else {
      stopScanner();
    }
    if (result.status === ScanStatus.ERROR) Haptics.error();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, [result.status]);

  return (
    <div className="flex flex-col flex-grow bg-black relative overflow-hidden">
      {/* Detection Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-[60] animate-fade-in pointer-events-none"></div>
      )}

      {/* Cyber-HUD Viewfinder Overlay */}
      {isCameraActive && (result.status === ScanStatus.SCANNING || result.status === ScanStatus.IDLE) && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
           {/* Dimmed Background with subtle blur */}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
           
           {/* Viewfinder Area */}
           <div className="relative w-72 h-72 sm:w-80 sm:h-80 z-20 flex items-center justify-center">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-14 h-14 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse"></div>
              <div className="absolute top-0 right-0 w-14 h-14 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-14 h-14 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-14 h-14 border-b-4 border-r-4 border-blue-500 rounded-br-3xl shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse"></div>
              
              {/* Internal Scanning HUD */}
              <div className="w-full h-full border border-white/5 rounded-3xl relative overflow-hidden">
                 {/* Laser Scanning Beam */}
                 <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,1)] animate-laser-scan"></div>
                 
                 {/* Decorative Grid Overlay */}
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              </div>
           </div>

           {/* Central Status Badge */}
           <div className="mt-20 z-20">
             <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 text-white px-8 py-3.5 rounded-full text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               Awaiting ID
             </div>
           </div>
        </div>
      )}

      {/* Camera Canvas with Perspective Transition */}
      <div className={`absolute inset-0 transition-all duration-700 ease-out ${result.status === ScanStatus.SUCCESS || result.status === ScanStatus.ERROR ? 'scale-95 blur-2xl opacity-40 translate-y-[-5%]' : 'opacity-100'}`}>
        <div id={containerId} className="w-full h-full"></div>
      </div>

      {/* Data Sync Overlay */}
      {result.status === ScanStatus.PROCESSING && (
         <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl z-50 flex flex-col items-center justify-center text-white animate-fade-in">
             <div className="relative mb-10">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20 scale-[2.5] duration-[2000ms]"></div>
                <div className="h-20 w-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </div>
             </div>
             <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-200 animate-pulse">Establishing Sync...</h3>
         </div>
      )}

      {/* Modern High-End Result Sheet */}
      {(result.status === ScanStatus.SUCCESS || result.status === ScanStatus.ERROR) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl rounded-t-[54px] shadow-[0_-30px_100px_rgba(0,0,0,0.6)] z-50 animate-slide-up pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-10 border-t border-white/20">
           {/* Sheet Handle */}
           <div className="w-16 h-1.5 bg-slate-200/60 rounded-full mx-auto mb-10"></div>
           
           <div className="px-10 flex flex-col items-center text-center">
             {result.status === ScanStatus.SUCCESS ? (
                <>
                  {/* Success Icon Visualization */}
                  <div className={`relative h-28 w-28 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl transition-all duration-500 scale-110 ${result.offline ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                    <div className="absolute inset-[-12px] rounded-[52px] border-2 border-current opacity-10 animate-pulse"></div>
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h3 className="text-[26px] font-black text-slate-900 mb-2 uppercase tracking-tighter leading-none">
                    {result.offline ? 'Cached Entry' : (result.action || 'Valid Access')}
                  </h3>
                  
                  <div className={`inline-flex items-center gap-2 mb-8 py-2.5 px-8 rounded-full font-black text-sm shadow-sm ring-1 ring-inset transition-colors ${result.offline ? 'bg-amber-50 text-amber-800 ring-amber-500/20' : 'bg-blue-50 text-blue-900 ring-blue-500/20'}`}>
                    {result.name || 'Official Participant'}
                  </div>

                  <p className="text-slate-400 mb-12 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] leading-relaxed opacity-80">
                    {result.offline ? 'Device storage utilized. Cloud sync will initiate automatically.' : 'Verified. Record updated.'}
                  </p>

                  <Button onClick={onReset} className="py-5 shadow-2xl active:scale-[0.98]">
                    Continue Operations
                  </Button>
                </>
             ) : (
                <>
                  {/* Error Icon Visualization */}
                  <div className="h-28 w-28 bg-red-500 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl shadow-red-500/40 animate-bounce-subtle">
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Sync Interrupted</h3>
                  <p className="text-slate-500 mb-12 text-[11px] font-bold uppercase tracking-[0.2em] max-w-[260px] leading-relaxed">
                    {result.message || 'The provided ID was rejected by the system.'}
                  </p>
                  
                  <Button onClick={onReset} variant="secondary" className="py-5 border-2 border-slate-100 text-slate-900">
                     Reset Terminal
                  </Button>
                </>
             )}
           </div>
        </div>
      )}

      <style>{`
        @keyframes laser-scan {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(18rem); opacity: 0; }
        }
        .animate-laser-scan {
          animation: laser-scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};