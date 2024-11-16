import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CardDashboardComponent } from './components/card-dashboard/card-dashboard.component';
import { SeasonalCalendarComponent } from './components/seasonal-calendar/seasonal-calendar.component';
import { CardSuggestionComponent } from './components/card-suggestion/card-suggestion.component';
import { CardTopsComponent } from './components/card-tops/card-tops.component';
import { MatcherComponent } from '../matcher/matcher.component';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TourStep, TOUR_STEPS } from './config/tour-steps.config';

interface NavItem {
  label: string;
  class: string;
  icon: string;
}

interface Step {
  element: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CardDashboardComponent,
    SeasonalCalendarComponent,
    CardSuggestionComponent,
    CardTopsComponent,
    MatcherComponent,
    OverlayPanelModule,
  ],
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss'],
})
export class Dashboard2Component implements OnInit, OnDestroy {
  items: NavItem[] = [];
  activeItem!: NavItem;
  isTourActive = false;
  currentStepIndex = 0;
  steps: TourStep[] = TOUR_STEPS;

  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  @ViewChild('welcomeElement') welcomeElement!: ElementRef;

  get currentStep(): TourStep {
    if (
      this.currentStepIndex >= 0 &&
      this.currentStepIndex < this.steps.length
    ) {
      return this.steps[this.currentStepIndex];
    }

    return {
      element: '',
      title: '',
      text: '',
    };
  }

  ngOnInit(): void {
    this.initMenuPoints();
  }

  ngOnDestroy(): void {
    this.steps = [];
    if (this.overlayPanel) {
      this.overlayPanel.hide();
    }
  }

  setActiveItem(item: NavItem) {
    this.activeItem = item;
  }

  private initMenuPoints() {
    this.items = [
      { label: 'Übersicht', class: 'pt-dashboard-home', icon: 'pi pi-home' },
      {
        label: 'Empfehlungen',
        class: 'pt-dashboard-match',
        icon: 'pi pi-star',
      },
      {
        label: 'Saisonkalender',
        class: 'pt-dashboard-saison',
        icon: 'pi pi-calendar',
      },
      { label: 'Tops', class: 'pt-dashboard-tops', icon: 'pi pi-chart-bar' },
    ];

    this.activeItem = this.items[0];
  }

  trackByLabel(index: number, item: NavItem): string {
    return item.label;
  }

  startTour(): void {
    if (this.steps.length > 0) {
      this.isTourActive = true;
      this.currentStepIndex = 0;
      this.showStep();
    }
  }

  showStep(): void {
    const step = this.currentStep;
    const element = document.querySelector(step.element);

    if (element) {
      this.overlayPanel.hide();
      setTimeout(() => {
        this.overlayPanel.target = element;
        this.overlayPanel.show(null, element);

        const overlayPanelElement = document.querySelector('.p-overlaypanel');
        if (overlayPanelElement) {
          const rect = element.getBoundingClientRect();
          (overlayPanelElement as HTMLElement).style.position = 'fixed';
          (overlayPanelElement as HTMLElement).style.top = `${rect.top}px`;
          (overlayPanelElement as HTMLElement).style.left = `${rect.left}px`;
        }
      }, 100);
    }
  }

  nextStep() {
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

  closeTour() {
    this.isTourActive = false;
    this.overlayPanel.hide();
  }

  closeWelcome() {
    if (this.welcomeElement) {
      this.welcomeElement.nativeElement.style.display = 'none';
    }
  }
}
