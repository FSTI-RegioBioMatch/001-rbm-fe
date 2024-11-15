import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private steps: Array<{ element: string, title: string, text: string }> = [];
  private startTourCallback: (() => void) | null = null;

  // Methode zum Festlegen der Schritte
  setSteps(steps: Array<{ element: string, title: string, text: string }>) {
    this.steps = steps;
  }

  // Methode zum Abrufen der Schritte
  getSteps() {
    return this.steps;
  }

  // Methode zum Registrieren des Start-Tour-Callbacks
  registerStartTourCallback(callback: () => void) {
    this.startTourCallback = callback;
  }

  // Methode zum Starten der Tour
  startTour() {
    if (this.startTourCallback) {
      this.startTourCallback();
    }
  }
}