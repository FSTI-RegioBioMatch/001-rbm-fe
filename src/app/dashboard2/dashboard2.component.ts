import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
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

interface NavItem {
  label: string;
  class: string;
  icon: string;
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
  steps = [
    { element: '.pt-sidebar-home', title: "Übersicht", text: 'In der Übersicht findest du Schnellinformationen' },
    { element: '.pt-sidebar-recipe', title: "Meine Rezepte", text: 'Erstelle, bearbeite oder schau dir deine Rezepte an' },
    { element: '.pt-sidebar-menus', title: "Meine Menüs", text: 'Hier findest du deine Menüs. Du kannst Menüs erstellen, eine EInkaufsliste erstellen/ansehen und Angebote in deiner Region finden' },
    { element: '.pt-sidebar-orders', title: "Bestellungen", text: 'Den aktuellen Stand von Bestellungen findest du hier' },
    { element: '.pt-toolbar-betrieb', title: "Betrieb", text: 'Wechsel falls nötig zwischen einem Betrieb' },
    { element: '.pt-toolbar-help', title: "Tour | Hilfe", text: 'Für eine Schritt für Schritt ERklärung kannst du auf jeder Seite diesen knopf drücken um die Tour zu starten.' },
    { element: '.pt-toolbar-profile', title: "Profil", text: 'Profil Seite mit Informationen über dich und deinem unternehmen' },
    { element: '.pt-dashboard-home', title: "Übersicht", text: 'In der Übersicht findest du 4 Reiter. Wir befinden uns in der Übersicht.' },
    { element: '.pt-dashboard-search', title: "Suche", text: 'Suche nach Regionalen Angeboten, Rezepten oder Menüs' },
    { element: '.pt-dashboard-map', title: "Map", text: 'Auf der Map findest du Farbig markierte Standorte von Anbieter. Klicke auf einen um die verfügbaren Produkte und andere Informationen zu lesen' },
    { element: '.pt-dashboard-match', title: "Empfehlungen", text: 'Du kannst zu Empfehlungen wechseln, ein Algorithmus der dir anhand lokaler Angebote Rezept Vorschläge erstellt.' },
    { element: '.pt-dashboard-saison', title: "Saison", text: 'Finde das passende für jede Saison!' },
    { element: '.pt-dashboard-tops', title: "Tops", text: 'Weitere informative Statistiken' },
  ];
  isTourActive = false;
  currentStepIndex = 0;

  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  @ViewChild('welcomeElement') welcomeElement!: ElementRef;

  ngOnInit(): void {
    this.initMenuPoints();
  }

  ngOnDestroy(): void {
    this.steps = [];
  }

  setActiveItem(item: NavItem) {
    this.activeItem = item;
  }

  private initMenuPoints() {
    this.items = [
      { label: 'Übersicht', class: 'pt-dashboard-home', icon: 'pi pi-home' },
      { label: 'Empfehlungen', class: 'pt-dashboard-match', icon: 'pi pi-star' },
      { label: 'Saisonkalender', class: 'pt-dashboard-saison', icon: 'pi pi-calendar' },
      { label: 'Tops', class: 'pt-dashboard-tops', icon: 'pi pi-chart-bar' },
    ];

    this.activeItem = this.items[0];
  }

  trackByLabel(index: number, item: NavItem): string {
    return item.label;
  }

  startTour() {
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