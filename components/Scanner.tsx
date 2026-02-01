import React, { useEffect, useState, useRef } from 'react';
import { Button } from './Button';
import { ScanResult, ScanStatus } from '../types';

// Use the core class for better control than the Scanner UI wrapper
declare const Html5Qrcode: any;

interface ScannerProps {
  onScan: (data: string) => void;
  result: ScanResult;
  onReset: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, result, onReset }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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

    // Don't start if already scanning
    if (scannerRef.current.isScanning) return;

    const config = {
      fps: 15,
      qrbox: (viewWidth: number, viewHeight: number) => {
        const size = Math.min(viewWidth, viewHeight) * 0.7;
        return { width: size, height: size };
      },
      aspectRatio: window.innerWidth / window.innerHeight,
    };

    try {
      setCameraError(null);
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          // Success callback
          stopScanner(); // Stop immediately on success to release camera
          onScan(decodedText);
        },
        () => {
          // Frame error callback - ignore for performance
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraError(err?.message || "Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    // Logic to start/stop based on status
    if (result.status === ScanStatus.IDLE || result.status === ScanStatus.SCANNING) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          }).catch(console.error);
        } else {
          scannerRef.current.clear();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.status]);

  const handleManualReset = () => {
    onReset();
    // scanner will restart via the useEffect above when status becomes SCANNING
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Viewfinder Overlay */}
      {isCameraActive && (result.status === ScanStatus.SCANNING || result.status === ScanStatus.IDLE) && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
           <div className="absolute inset-0 bg-black/40"></div>
           
           <div className="relative w-64 h-64 sm:w-72 sm:h-72 z-20">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-lg shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-lg shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-lg shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-lg shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              
              {/* Animated Scan Line */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,1)] animate-scan-move"></div>
           </div>

           <div className="mt-12 z-20">
             <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide shadow-2xl flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               Ready to Scan
             </div>
           </div>
        </div>
      )}

      {/* Camera Viewport */}
      <div className={`flex-grow relative flex items-center justify-center transition-all duration-700 ${result.status === ScanStatus.SUCCESS ? 'scale-110 blur-xl opacity-30' : 'opacity-100'}`}>
        <div id={containerId} className="w-full h-full [&_video]:object-cover"></div>
        
        {/* Initialization State */}
        {!isCameraActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-0">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
             </div>
             <p className="mt-6 text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">System Initializing</p>
          </div>
        )}

        {/* Camera Access Error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center z-20">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Camera Access Denied</h2>
            <p className="text-slate-400 text-sm mb-6">{cameraError}</p>
            <Button onClick={() => window.location.reload()} className="max-w-[200px]">
              Refresh App
            </Button>
          </div>
        )}

        {/* Processing State */}
        {result.status === ScanStatus.PROCESSING && (
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-white animate-fade-in">
               <div className="relative mb-8">
                 <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-20"></div>
                 <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
               </div>
               <h3 className="text-xl font-bold tracking-tight">Syncing with Server...</h3>
               <p className="text-blue-200/60 text-sm mt-2 font-medium">KUAPC DIGITAL INFRASTRUCTURE</p>
           </div>
        )}
      </div>

      {/* Results Bottom Sheet */}
      {(result.status === ScanStatus.SUCCESS || result.status === ScanStatus.ERROR) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] z-50 animate-slide-up pb-10 pt-4 border-t border-slate-100">
           <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
           
           <div className="px-10 flex flex-col items-center text-center">
             {result.status === ScanStatus.SUCCESS ? (
                <>
                  <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(34,197,94,0.3)] ring-8 ring-green-50">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">
                    {result.action || 'Attendance'} Recorded
                  </h3>
                  
                  <div className="text-xl font-bold text-blue-700 mb-4 py-1 px-4 bg-blue-50 rounded-full inline-block">
                    {result.name || 'Staff Member'}
                  </div>

                  <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed max-w-[280px]">
                    Information synchronized successfully with the KUAPC central database.
                  </p>
                  
                  <Button onClick={handleManualReset} className="shadow-lg shadow-blue-900/20 rounded-2xl py-4">
                    Scan Next Profile
                  </Button>
                </>
             ) : (
                <>
                  <div className="h-20 w-20 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(239,68,68,0.3)] ring-8 ring-red-50">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Sync Failed</h3>
                  <p className="text-slate-500 mb-8 text-sm font-medium max-w-[260px]">
                    {result.message || 'System error: Data packet rejected or invalid QR code detected.'}
                  </p>
                  <Button onClick={handleManualReset} variant="secondary" className="rounded-2xl border-2 py-4">
                     Retry Scanning
                  </Button>
                </>
             )}
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan-line-move {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(16rem); opacity: 0; }
        }
        .animate-scan-move {
          animation: scan-line-move 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};