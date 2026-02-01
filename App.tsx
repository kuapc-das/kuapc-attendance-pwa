import React, { useState, useCallback, useEffect } from 'react';
import { Login } from './components/Login';
import { Scanner } from './components/Scanner';
import { Header } from './components/Header';
import { OfflineManager } from './components/OfflineManager';
import { submitAttendance, syncPendingScans, getPendingCount } from './services/api';
import { VolunteerSession, ScanResult, ScanStatus } from './types';
import { Haptics } from './utils/haptics';

function App() {
  const [session, setSession] = useState<VolunteerSession>({
    vtoken: '',
    isLoggedIn: false,
  });

  const [scanResult, setScanResult] = useState<ScanResult>({
    data: null,
    status: ScanStatus.IDLE,
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState(false);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch (e) {
      console.error('Pending count error', e);
    }
  }, []);

  const performSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncPendingScans();
      await updatePendingCount();
    } catch (e) {
      console.error('Sync error', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    updatePendingCount();
    if (navigator.onLine) performSync();

    const syncInterval = setInterval(() => {
      if (navigator.onLine) performSync();
      else updatePendingCount();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [performSync, updatePendingCount]);

  const handleLogin = async (token: string) => {
    Haptics.success();
    setSession({ vtoken: token, isLoggedIn: true });
    setScanResult({ data: null, status: ScanStatus.SCANNING });
  };

  const handleLogout = () => {
    setSession({ vtoken: '', isLoggedIn: false });
    setScanResult({ data: null, status: ScanStatus.IDLE });
  };

  const handleScan = useCallback(async (rawData: string) => {
    const trimmedData = rawData.trim();
    let cleanId = trimmedData;
    try {
      if (trimmedData.includes('id=')) {
        const urlObj = new URL(trimmedData);
        cleanId = urlObj.searchParams.get('id') || trimmedData;
      }
    } catch (e) {}

    setScanResult({ data: cleanId, status: ScanStatus.PROCESSING });

    try {
      const response = await submitAttendance(session.vtoken, trimmedData);
      updatePendingCount();
      if (response.success) {
        setScanResult({
          data: cleanId,
          status: ScanStatus.SUCCESS,
          message: response.message,
          name: response.name,
          action: response.action,
          offline: response.offline
        });
      } else {
        setScanResult({
          data: cleanId,
          status: ScanStatus.ERROR,
          message: response.message,
          name: response.name
        });
      }
    } catch (error) {
      setScanResult({
        data: cleanId,
        status: ScanStatus.ERROR,
        message: 'System Fault Detected',
      });
    }
  }, [session.vtoken, updatePendingCount]);

  const resetScanner = () => {
    setScanResult({ data: null, status: ScanStatus.SCANNING });
  };

  if (!session.isLoggedIn) {
    return (
      <div className="flex flex-col flex-grow bg-slate-50">
        <Login onLogin={handleLogin} isLoading={false} error={null} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-black">
      <Header 
        onLogout={handleLogout} 
        vtoken={session.vtoken} 
        isOnline={isOnline}
        pendingCount={pendingCount}
        onOpenOfflineManager={() => setIsOfflineManagerOpen(true)}
      />
      <main className="flex-grow relative flex flex-col overflow-hidden">
        <Scanner onScan={handleScan} result={scanResult} onReset={resetScanner} />
      </main>

      <OfflineManager 
        isOpen={isOfflineManagerOpen} 
        onClose={() => setIsOfflineManagerOpen(false)}
        onUpdateCount={updatePendingCount}
      />
    </div>
  );
}

export default App;