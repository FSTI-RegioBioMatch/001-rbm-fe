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
import { SearchComponent } from './components/search/search.component';
import { SearchService } from '../shared/services/search.service';

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
    SearchComponent,
    CardModule,
    InputTextModule,
    CardDashboardComponent,
    SeasonalCalendarComponent,
    CardSuggestionComponent,
    CardTopsComponent,
  ],
  providers: [SearchService],
  templateUrl: './dashboard2.component.html',
})
export class Dashboard2Component implements OnInit {
  items: NavItem[] = [];
  activeItem!: NavItem;
  searchText: string = '';
  isSearchActive: boolean = false;

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.initMenuPoints();
  }

  setActiveItem(item: NavItem) {
    this.activeItem = item;
    this.isSearchActive = false;
    this.searchText = '';
    this.searchService.clearSearch();
  }

  onSearchChange(term: string) {
    if (term.trim().length >= 2) {
      this.isSearchActive = true;
      this.searchService.search(term);
    } else if (term.trim().length === 0) {
      this.isSearchActive = false;
      this.searchService.clearSearch();
    }
  }

  onSearch() {
    if (this.searchText.trim().length >= 2) {
      this.isSearchActive = true;
      this.searchService.search(this.searchText);
    }
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
