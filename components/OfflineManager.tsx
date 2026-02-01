import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { OfflineScan } from '../types';
import { getPendingScans, syncItem, removeScanOffline, clearAllOfflineScans } from '../services/api';
import { Haptics } from '../utils/haptics';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCount: () => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose, onUpdateCount }) => {
  const [scans, setScans] = useState<OfflineScan[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const fetchScans = async () => {
    const pending = await getPendingScans();
    setScans(pending);
  };

  useEffect(() => {
    if (isOpen) {
      fetchScans();
    }
  }, [isOpen]);

  const handleRetry = async (scan: OfflineScan) => {
    if (!navigator.onLine) {
      Haptics.error();
      return;
    }

    setLoadingIds(prev => new Set(prev).add(scan.id));
    const success = await syncItem(scan);
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(scan.id);
      return next;
    });

    if (success) {
      Haptics.success();
      fetchScans();
      onUpdateCount();
    } else {
      Haptics.error();
    }
  };

  const handleDelete = async (id: number) => {
    Haptics.light();
    if (confirm("Remove this scan?")) {
      await removeScanOffline(id);
      Haptics.success();
      fetchScans();
      onUpdateCount();
    }
  };

  const handleRetryAll = async () => {
    if (!navigator.onLine) {
      Haptics.error();
      return;
    }
    
    setIsSyncingAll(true);
    for (const scan of scans) {
      await syncItem(scan);
    }
    Haptics.success();
    setIsSyncingAll(false);
    fetchScans();
    onUpdateCount();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-50 rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pb-[env(safe-area-inset-bottom)]">
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Sync Queue</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              {scans.length} Items Pending
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-2 bg-slate-50">
          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Queue Empty</p>
            </div>
          ) : (
            scans.map((scan) => (
              <div key={scan.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {scan.scanInput}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-tight">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button 
                    onClick={() => handleRetry(scan)}
                    disabled={loadingIds.has(scan.id)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-transform"
                  >
                    {loadingIds.has(scan.id) ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={() => handleDelete(scan.id)}
                    className="p-3 bg-slate-50 text-slate-300 rounded-xl"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {scans.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-50">
            <Button 
              onClick={handleRetryAll} 
              isLoading={isSyncingAll}
              loadingText="Syncing..."
              className="py-4 rounded-2xl"
            >
              Sync All Scans
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};