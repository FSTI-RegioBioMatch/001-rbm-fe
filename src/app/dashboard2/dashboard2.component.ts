import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { MapComponent } from './components/map/map.component';
import { OfferType } from '../shared/types/offer.type';
import { OfferService } from '../shared/services/offer.service';
import { StoreService } from '../shared/store/store.service';
import { AddressType } from '../shared/types/address.type';
import { CardCompanyComponent } from './components/card-company/card-company.component';
import { CompanyType } from '../shared/types/company.type';
import { PersonType } from '../shared/types/person.type';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { filter } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';
import { CardDashboardComponent } from './components/card-dashboard/card-dashboard.component';
import { SeasonalCalendarComponent } from './components/seasonal-calendar/seasonal-calendar.component';
import { CardSuggestionComponent } from './components/card-suggestion/card-suggestion.component';

@Component({
  selector: 'app-dashboard2',
  standalone: true,
  imports: [
    Button,
    TabMenuModule,
    CardModule,
    MapComponent,
    CardCompanyComponent,
    InputTextModule,
    PaginatorModule,
    TableModule,
    JsonPipe,
    CardDashboardComponent,
    SeasonalCalendarComponent,
    CardSuggestionComponent,
  ],
  templateUrl: './dashboard2.component.html',
  styleUrl: './dashboard2.component.scss',
})
export class Dashboard2Component implements OnInit, AfterViewInit {
  items!: MenuItem[];
  activeItem!: MenuItem;

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initMenuPoints();
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  private initMenuPoints() {
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-home' },
      { label: 'Recommendations', icon: 'pi pi-chart-line' },
      { label: 'SeasonCalendar', icon: 'pi pi-list' },
    ];

    this.activeItem = this.items[0];
  }
}
