import { AttendanceResponse } from '../types';
import { API_CONFIG } from '../config';

/**
 * Extracts a participant ID from a string, handling both raw IDs and URLs.
 * This prevents using potentially broken/old URLs contained in QR codes.
 */
const extractId = (input: string): string => {
  const cleanInput = input.trim();
  if (cleanInput.startsWith('http')) {
    try {
      const url = new URL(cleanInput);
      // Try to find 'id' or 'uid' or 'participantId' in the query string
      const id = url.searchParams.get('id') || url.searchParams.get('uid') || url.searchParams.get('participantId');
      if (id) return id;
      
      // If no specific ID param is found in the URL, return the whole string
      // In some systems, the URL itself IS the identifier.
      return cleanInput; 
    } catch (e) {
      return cleanInput;
    }
  }
  return cleanInput;
};

/**
 * Submit participant attendance via GET request using the specific KUAPC Cloudflare Proxy.
 */
export const submitAttendance = async (vtoken: string, scanInput: string): Promise<AttendanceResponse> => {
  try {
    const participantId = extractId(scanInput);
    
    // Build the clean target URL with params
    const params = new URLSearchParams();
    params.append('id', participantId);
    params.append('vtoken', vtoken);
    // Include pwa=1 to ensure JSON response from backend
    params.append('pwa', '1');
    // Cache buster
    params.append('_t', Date.now().toString());

    // Construct the Google Apps Script URL
    const target = `${API_CONFIG.APPS_SCRIPT_URL}?${params.toString()}`;

    // Construct the Proxy URL
    const proxyUrl = `${API_CONFIG.PROXY_URL}/?target=${encodeURIComponent(target)}`;

    console.log('Sending request to:', proxyUrl);

    const response = await fetch(proxyUrl, { 
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Proxy responded with status ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.success === true,
      message: data.message || (data.success ? 'Attendance recorded' : 'Scan failed'),
      timestamp: data.timestamp || new Date().toLocaleTimeString(),
      name: data.name || 'Participant',
      action: data.action || 'Attendance'
    };
  } catch (error) {
    console.error('Submission error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
      timestamp: new Date().toLocaleTimeString(),
      name: ''
    };
  }
};