// tour.component.ts
import { Component, ViewChild, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TourService } from '../shared/services/tour.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NgModule, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss'],
  standalone: true,
  imports: [
    OverlayPanelModule,
    CommonModule,
    ButtonModule,
  ],
  encapsulation: ViewEncapsulation.None
})
export class TourComponent implements OnInit, OnDestroy {
  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  isTourActive = false;
  currentStepIndex = 0;
  steps: Array<{ element: string, title: string, text: string }> = [];

  constructor(
    private tourService: TourService,
    private el: ElementRef,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.tourService.registerStartTourCallback(() => this.startTour());
  }

  ngOnDestroy() {
    this.tourService.registerStartTourCallback(() => {});
    this.steps = [];
  }

  startTour() {
    // Lade die Schritte aus dem TourService, wenn die Tour gestartet wird
    this.steps = this.tourService.getSteps();
    this.checkAndSetDisplay();
    if (this.steps.length > 0) {
      this.isTourActive = true;
      this.currentStepIndex = 0;
      this.showStep();
    }
  }

  showStep() {
    const step = this.steps[this.currentStepIndex];
    const element = document.querySelector(step.element);

    if (element) {
      this.overlayPanel.hide(); // Verberge das Panel zunächst
      setTimeout(() => {
        this.overlayPanel.target = element; // Setze das Ziel-Element
        this.overlayPanel.show(null, element); // Zeige das Panel beim Ziel-Element an

        // Positioniere das Overlay-Panel fest an der gewünschten Stelle
        const overlayPanelElement = document.querySelector('.p-overlaypanel');
        if (overlayPanelElement) {
          const rect = element.getBoundingClientRect();
          (overlayPanelElement as HTMLElement).style.position = 'fixed';
          (overlayPanelElement as HTMLElement).style.top = `${rect.top}px`;
          (overlayPanelElement as HTMLElement).style.left = `${rect.left}px`;
        }
      }, 100); // Verwende einen kleinen Timeout für korrekte Positionierung
    }
  }

  nextStep() {
    this.overlayPanel.hide(); // Verberge das Panel
    setTimeout(() => {
      this.currentStepIndex++;
      if (this.currentStepIndex < this.steps.length) {
        this.showStep();
      } else {
        this.closeTour();
      }
    }, 100);
  }

  closeTour() {
    this.isTourActive = false;
    this.overlayPanel.hide();
    this.steps = [];
  }

  checkAndSetDisplay() {
    if (this.router.url === '/dashboard') {
      const element = document.querySelector('.dashboard-welcome-active');
      if (element) {
        this.renderer.setStyle(element, 'display', 'flex');
      }
    }
  }
}
