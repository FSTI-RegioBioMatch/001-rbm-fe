export interface LogEntry {
    timestamp: string;  // ISO 8601 format: "2024-09-04T12:34:56Z"
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    userId?: string;  // Optional: ID of the user causing the log
    additionalData?: any;  // Optional: Any additional debugging info (could be JSON)
  }
  