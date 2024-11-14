import { Component, OnInit } from '@angular/core';
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

interface NavItem {
  label: string;
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
  ],
  templateUrl: './dashboard2.component.html',
})
export class Dashboard2Component implements OnInit {
  items: NavItem[] = [];
  activeItem!: NavItem;

  constructor() {}

  ngOnInit(): void {
    this.initMenuPoints();
  }

  setActiveItem(item: NavItem) {
    this.activeItem = item;
  }

  private initMenuPoints() {
    this.items = [
      { label: 'Übersicht', icon: 'pi pi-home' },
      { label: 'Empfehlungen', icon: 'pi pi-star' },
      { label: 'Saisonkalender', icon: 'pi pi-calendar' },
      { label: 'Tops', icon: 'pi pi-chart-bar' },
    ];

    this.activeItem = this.items[0];
  }
}
