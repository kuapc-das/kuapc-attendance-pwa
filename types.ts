// ==========================
// Scan Status Enum
// ==========================
export enum ScanStatus {
  IDLE = 'IDLE',          // Scanner not started yet
  SCANNING = 'SCANNING',  // Actively scanning
  PROCESSING = 'PROCESSING', // Awaiting backend response
  SUCCESS = 'SUCCESS',    // Scan processed successfully
  ERROR = 'ERROR'         // Scan failed or invalid
}

// ==========================
// Scanner Result Interface
// ==========================
export interface ScanResult {
  data: string | null;     // QR code data
  status: ScanStatus;      // Current scan status
  message?: string;        // Optional success/error message
  name?: string;           // Participant name from backend
  action?: string;         // "Entry" or "Exit"
}

// ==========================
// Volunteer Session Interface
// ==========================
export interface VolunteerSession {
  vtoken: string;          // Volunteer token
  isLoggedIn: boolean;     // Login state
}

// ==========================
// Attendance Response from backend
// ==========================
export interface AttendanceResponse {
  success: boolean;        // True if attendance recorded
  message: string;         // Feedback message
  timestamp: string;       // Timestamp of attendance
  name: string;            // Participant name
  action?: string;         // Entry/Exit status
}