import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LogEntry } from '../types/log-entry.model';
import { StoreService } from '../store/store.service';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly logEndpoint = `${environment.API_CORE}/logs`;
  private readonly localStorageKey = 'failedLogs';

  constructor(private http: HttpClient, private storeService: StoreService) {}

  log(
    message: string,
    level: 'INFO' | 'WARN' | 'ERROR' = 'INFO',
    additionalData?: any,
    timestamp?: string,
    userId?: string
  ): void {
    const logEntry: LogEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level,
      message,
      userId,
      additionalData,
    };
    this.sendLog(logEntry).subscribe({
      next: () => {
        console.log('Log sent to server:', logEntry);
      },
      error: (err) => {
        console.error('Failed to send log to server:', err);
        this.saveLogToLocal(logEntry); // Save to local storage only on error
      }
    });
  }

  private sendLog(logEntry: LogEntry): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap((company) => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
  
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
        return this.http.post<any>(this.logEndpoint, logEntry, { headers }).pipe(
          tap(() => {
            // Log sent successfully, remove it from local storage if it exists
            this.removeLogFromLocal(logEntry);
          })
        );
      }),
      catchError((error) => {
        console.error('Failed to send log to server:', error);
        // Save the log to local storage if sending fails
        this.saveLogToLocal(logEntry);
        return throwError(error);
      })
    );
  }
  

  private saveLogToLocal(logEntry: LogEntry): void {
    const failedLogs = this.getFailedLogs();
    // Avoid saving duplicate logs
    const logExists = failedLogs.some(log => log.timestamp === logEntry.timestamp);
    if (!logExists) {
      failedLogs.push(logEntry);
      localStorage.setItem(this.localStorageKey, JSON.stringify(failedLogs));
    }
  }

  private getFailedLogs(): LogEntry[] {
    const failedLogs = localStorage.getItem(this.localStorageKey);
    return failedLogs ? JSON.parse(failedLogs) : [];
  }

  retryFailedLogs(): void {
    const failedLogs = this.getFailedLogs();
    if (failedLogs.length > 0) {
      const logEntry = failedLogs[0]; // Process one log at a time
      this.sendLog(logEntry).subscribe({
        next: () => {
          console.log('Resent failed log:', logEntry);
        },
        error: (err) => {
          console.error('Failed to resend log:', logEntry, err);
          // Do not re-save log to prevent duplication
        }
      });
    }
  }
  

  private removeLogFromLocal(logEntry: LogEntry): void {
    const failedLogs = this.getFailedLogs();
    const updatedLogs = failedLogs.filter(log => log.timestamp !== logEntry.timestamp);
    localStorage.setItem(this.localStorageKey, JSON.stringify(updatedLogs));
  }
}
