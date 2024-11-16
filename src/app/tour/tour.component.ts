import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TourService } from '../shared/services/tour.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ViewEncapsulation } from '@angular/core';

interface TourStep {
  element: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.scss'],
  standalone: true,
  imports: [OverlayPanelModule, CommonModule, ButtonModule],
  encapsulation: ViewEncapsulation.None,
})
export class TourComponent implements OnInit, OnDestroy {
  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;

  isTourActive = false;
  currentStepIndex = 0;
  steps: TourStep[] = [];

  get currentStep(): TourStep {
    if (
      this.currentStepIndex >= 0 &&
      this.currentStepIndex < this.steps.length
    ) {
      return this.steps[this.currentStepIndex];
    }
    return { element: '', title: '', text: '' };
  }

  constructor(
    private tourService: TourService,
    private el: ElementRef,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.tourService.registerStartTourCallback(() => this.startTour());
  }

  ngOnDestroy(): void {
    this.tourService.registerStartTourCallback(() => {});
    this.cleanup();
  }

  private cleanup(): void {
    this.steps = [];
    this.isTourActive = false;
    this.currentStepIndex = 0;
    if (this.overlayPanel) {
      this.overlayPanel.hide();
    }
  }

  startTour(): void {
    this.steps = this.tourService.getSteps();
    this.checkAndSetDisplay();

    if (this.steps.length > 0) {
      this.isTourActive = true;
      this.currentStepIndex = 0;
      setTimeout(() => this.showStep(), 0);
    }
  }

  showStep(): void {
    const element = document.querySelector(this.currentStep.element);
    if (!element || !this.overlayPanel) return;

    this.overlayPanel.hide();
    setTimeout(() => {
      this.overlayPanel.target = element;
      this.overlayPanel.show(null, element);

      const overlayPanelElement = document.querySelector('.p-overlaypanel');
      if (overlayPanelElement) {
        const rect = element.getBoundingClientRect();
        this.renderer.setStyle(overlayPanelElement, 'position', 'fixed');
        this.renderer.setStyle(overlayPanelElement, 'top', `${rect.top}px`);
        this.renderer.setStyle(overlayPanelElement, 'left', `${rect.left}px`);
        this.renderer.setStyle(overlayPanelElement, 'margin', '0');
        this.renderer.setStyle(overlayPanelElement, 'padding', '0');
      }
    }, 100);
  }

  nextStep(): void {
    if (!this.overlayPanel) return;

    this.overlayPanel.hide();
    setTimeout(() => {
      this.currentStepIndex++;
      if (this.currentStepIndex < this.steps.length) {
        this.showStep();
      } else {
        this.closeTour();
      }
    }, 100);
  }

  closeTour(): void {
    this.isTourActive = false;
    if (this.overlayPanel) {
      this.overlayPanel.hide();
    }
    this.steps = [];
  }

  private checkAndSetDisplay(): void {
    if (this.router.url === '/dashboard') {
      const element = document.querySelector('.dashboard-welcome-active');
      if (element) {
        this.renderer.setStyle(element, 'display', 'flex');
      }
    }
  }
}
