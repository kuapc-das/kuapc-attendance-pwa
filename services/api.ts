import { AttendanceResponse, OfflineScan } from '../types';
import { API_CONFIG } from '../config';
import * as OfflineStorage from './offlineStorage';

/**
 * Extracts a participant ID from a string, handling both raw IDs and URLs.
 */
const extractId = (input: string): string => {
  const cleanInput = input.trim();
  if (cleanInput.startsWith('http')) {
    try {
      const url = new URL(cleanInput);
      const id = url.searchParams.get('id') || url.searchParams.get('uid') || url.searchParams.get('participantId');
      if (id) return id;
      return cleanInput; 
    } catch (e) {
      return cleanInput;
    }
  }
  return cleanInput;
};

/**
 * Submit participant attendance. 
 * Falls back to offline storage if network is unavailable or request fails.
 */
export const submitAttendance = async (vtoken: string, scanInput: string): Promise<AttendanceResponse> => {
  const isOnline = navigator.onLine;
  const participantId = extractId(scanInput);

  // Function to handle offline saving
  const saveOffline = async (): Promise<AttendanceResponse> => {
    try {
      await OfflineStorage.saveScanOffline(vtoken, scanInput);
      return {
        success: true,
        message: 'Saved to device (Offline)',
        timestamp: new Date().toLocaleTimeString(),
        name: `ID: ${participantId}`,
        action: 'Pending Sync',
        offline: true
      };
    } catch (e) {
      return {
        success: false,
        message: 'Storage Error: Could not save offline.',
        timestamp: new Date().toLocaleTimeString(),
        name: ''
      };
    }
  };

  // 1. If explicitly offline, save immediately
  if (!isOnline) {
    return saveOffline();
  }

  // 2. Try Online Request
  try {
    const params = new URLSearchParams();
    params.append('id', participantId);
    params.append('vtoken', vtoken);
    params.append('pwa', '1');
    params.append('_t', Date.now().toString());

    const target = `${API_CONFIG.APPS_SCRIPT_URL}?${params.toString()}`;
    const proxyUrl = `${API_CONFIG.PROXY_URL}/?target=${encodeURIComponent(target)}`;

    console.log('Sending request to:', proxyUrl);

    // Timeout after 8 seconds to allow fallback to offline
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(proxyUrl, { 
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.success === true,
      message: data.message || (data.success ? 'Attendance recorded' : 'Scan failed'),
      timestamp: data.timestamp || new Date().toLocaleTimeString(),
      name: data.name || 'Participant',
      action: data.action || 'Attendance',
      offline: false
    };
  } catch (error) {
    console.warn('Network request failed, attempting offline save:', error);
    // 3. If request fails (timeout or network error), save offline
    return saveOffline();
  }
};

/**
 * Syncs a single specific scan item.
 */
export const syncItem = async (scan: OfflineScan): Promise<boolean> => {
  if (!navigator.onLine) return false;
  try {
    const result = await submitAttendance(scan.vtoken, scan.scanInput);
    if (result.success && !result.offline) {
      await OfflineStorage.removeScanOffline(scan.id);
      return true;
    }
  } catch (e) {
    console.error(`Failed to sync item ${scan.id}`, e);
  }
  return false;
};

/**
 * Syncs all pending offline scans to the server.
 * Returns the number of successfully synced items.
 */
export const syncPendingScans = async (): Promise<number> => {
  if (!navigator.onLine) return 0;

  const pending = await OfflineStorage.getPendingScans();
  if (pending.length === 0) return 0;

  let syncedCount = 0;

  for (const scan of pending) {
    const success = await syncItem(scan);
    if (success) syncedCount++;
  }

  return syncedCount;
};

export const getPendingCount = OfflineStorage.getPendingCount;
export const getPendingScans = OfflineStorage.getPendingScans;
export const removeScanOffline = OfflineStorage.removeScanOffline;
export const clearAllOfflineScans = OfflineStorage.clearAllOfflineScans;