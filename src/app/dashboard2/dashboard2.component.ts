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
  ],
  templateUrl: './dashboard2.component.html',
  styleUrl: './dashboard2.component.scss',
})
export class Dashboard2Component implements OnInit, AfterViewInit {
  offers: OfferType[] = [];

  items!: MenuItem[];
  activeItem!: MenuItem;
  company!: CompanyType | null;
  person!: PersonType | null;
  menuPlans: any[] = [];

  mapLat: number = 0;
  mapLng: number = 0;

  constructor(
    public offerService: OfferService,
    private store: StoreService,
    private menuPlanningService: NewMenuplanService,
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.getCurrentPersonAndCompanyContext();
    this.initMenuPoints();
    this.getOffers();
    this.getSelectedCompanyContext();

    this.store.selectedCompanyContext$
      .pipe(filter((company) => company !== null))
      .subscribe(() => {
        this.getMenuPlans();
      });

    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  private initMenuPoints() {
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-home' },
      { label: 'Transactions', icon: 'pi pi-chart-line' },
      { label: 'Products', icon: 'pi pi-list' },
    ];
  }

  private getOffers() {
    this.offerService.offers$.subscribe((offers) => {
      this.offers = offers;
    });
  }

  private getMenuPlans() {
    this.menuPlanningService.getAllMenuPlans().subscribe((menuPlans) => {
      this.menuPlans = menuPlans;
      console.log('Menu plans updated', menuPlans);
    });
  }

  private getSelectedCompanyContext() {
    this.store.selectedCompanyContext$.subscribe((company) => {
      if (company && company.addresses && company.addresses.length > 0) {
        const addressUrl = company.addresses[0].self;
        this.offerService
          .getAddress(addressUrl)
          .subscribe((address: AddressType) => {
            console.log('Address updated', address);
            this.mapLat = address.lat;
            this.mapLng = address.lon;

            const searchRadiusInKM = 50;
            this.offerService.setOffersBySearchRadius(
              searchRadiusInKM,
              address,
            );
          });
      }
    });
  }

  private getCurrentPersonAndCompanyContext() {
    this.store.person$.subscribe((person) => {
      console.log('Person updated', person);
      this.person = person;
    });

    this.store.selectedCompanyContext$.subscribe((company) => {
      this.company = company;
      console.log('Company updated', company);
    });
  }
}
