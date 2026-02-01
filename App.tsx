import React, { useState, useCallback } from 'react';
import { Login } from './components/Login';
import { Scanner } from './components/Scanner';
import { Header } from './components/Header';
import { submitAttendance } from './services/api';
import { VolunteerSession, ScanResult, ScanStatus } from './types';

function App() {
  // State
  const [session, setSession] = useState<VolunteerSession>({
    vtoken: '',
    isLoggedIn: false,
  });

  const [scanResult, setScanResult] = useState<ScanResult>({
    data: null,
    status: ScanStatus.IDLE,
  });

  // ======================
  // Handle Login
  // ======================
  const handleLogin = async (token: string) => {
    // Directly proceed without server-side validation
    setSession({
      vtoken: token,
      isLoggedIn: true,
    });
    setScanResult({ data: null, status: ScanStatus.SCANNING });
  };

  // ======================
  // Handle Logout
  // ======================
  const handleLogout = () => {
    setSession({ vtoken: '', isLoggedIn: false });
    setScanResult({ data: null, status: ScanStatus.IDLE });
  };

  // ======================
  // Handle Scan
  // ======================
  const handleScan = useCallback(
    async (rawData: string) => {
      const trimmedData = rawData.trim();
      
      // Logic to extract ID for DISPLAY purposes
      let cleanId = trimmedData;
      try {
        if (trimmedData.includes('id=')) {
          // If it's a full URL like .../exec?id=123, extract 123 for UI
          const urlObj = new URL(trimmedData);
          const idParam = urlObj.searchParams.get('id');
          if (idParam) cleanId = idParam;
        }
      } catch (e) {
        // If it fails to parse as URL, assume rawData is the ID itself
        console.debug('Scanned data is not a URL, using raw data for display');
      }

      // Update status to PROCESSING immediately
      setScanResult({ data: cleanId, status: ScanStatus.PROCESSING });

      try {
        // Pass the raw trimmed data to the API. 
        // The API service will decide if it needs to use the URL provided in the QR code or construct one.
        const response = await submitAttendance(session.vtoken, trimmedData);

        if (response.success) {
          setScanResult({
            data: cleanId,
            status: ScanStatus.SUCCESS,
            message: response.message,
            name: response.name,
            action: response.action
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
          message: 'Failed to connect to server.',
        });
      }
    },
    [session.vtoken]
  );

  // ======================
  // Reset Scanner
  // ======================
  const resetScanner = () => {
    setScanResult({ data: null, status: ScanStatus.SCANNING });
  };

  // ======================
  // Render
  // ======================
  if (!session.isLoggedIn) {
    return <Login onLogin={handleLogin} isLoading={false} error={null} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-black">
      <Header onLogout={handleLogout} vtoken={session.vtoken} />
      <main className="flex-grow relative flex flex-col overflow-hidden">
        <Scanner onScan={handleScan} result={scanResult} onReset={resetScanner} />
      </main>
    </div>
  );
}

export default App;