import { Component, OnInit } from '@angular/core';
import { CardCompanyComponent } from '../card-company/card-company.component';
import { CardModule } from 'primeng/card';
import { MapComponent } from '../map/map.component';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AddressType } from '../../../shared/types/address.type';
import { CompanyType } from '../../../shared/types/company.type';
import { PersonType } from '../../../shared/types/person.type';
import { filter } from 'rxjs/operators';
import { OfferService } from '../../../shared/services/offer.service';
import { StoreService } from '../../../shared/store/store.service';
import { NewMenuplanService } from '../../../shared/services/new-menuplan.service';
import { OfferType } from '../../../shared/types/offer.type';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-card-dashboard',
  standalone: true,
  imports: [
    CardCompanyComponent,
    CardModule,
    MapComponent,
    PrimeTemplate,
    TableModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './card-dashboard.component.html',
  styleUrl: './card-dashboard.component.scss',
})
export class CardDashboardComponent implements OnInit {
  company!: CompanyType | null;
  person!: PersonType | null;
  offers: OfferType[] = [];
  menuPlans: any[] = [];

  mapLat: number = 0;
  mapLng: number = 0;

  constructor(
    public offerService: OfferService,
    private store: StoreService,
    private menuPlanningService: NewMenuplanService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.getCurrentPersonAndCompanyContext();
    this.getOffers();
    this.getSelectedCompanyContext();

    this.store.selectedCompanyContext$
      .pipe(filter((company) => company !== null))
      .subscribe(() => {
        this.getMenuPlans();
      });
  }

  private getOffers() {
    this.offerService.offers$.subscribe((offers) => {
      this.offers = offers;
    });
  }

  private getMenuPlans() {
    this.menuPlanningService.getAllMenuPlans().subscribe((menuPlans) => {
      this.menuPlans = menuPlans;
      this.messageService.add({severity: 'info', summary: 'OK', detail: 'Menüpläne wurden aktualisiert'});
      console.log('Menu plans updated', menuPlans);
    });
  }

  private getSelectedCompanyContext() {
    this.store.selectedCompanyContext$.subscribe((company) => {
      if (company && company.addresses && company.addresses.length > 0) {
        const addressUrl = company.addresses[0].self;
        // Fetch the address
        this.offerService
          .getAddress(addressUrl)
          .subscribe((address: AddressType) => {
            this.messageService.add({severity: 'info', summary: 'OK', detail: 'Addresse wurde aktualisiert'});
            console.log('Address updated', address);
            // Set the address in OfferService so it can be used later
            this.offerService.setAddress(address);
            this.mapLat = address.lat;
            this.mapLng = address.lon;
  
            const searchRadiusInKM = 50;
            // Fetch the offers using the newly set address
            this.offerService.setOffersBySearchRadius(
              searchRadiusInKM,
              address,
            );
          });
      } else {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Keine gültige Unternehmensaddresse gefunden'});
        console.error('No valid company address found');
      }
    });
  }

  private getCurrentPersonAndCompanyContext() {
    this.store.person$.subscribe((person) => {
      this.messageService.add({severity: 'info', summary: 'OK', detail: 'Person wurde aktualisiert'});
      console.log('Person updated', person);
      this.person = person;
    });

    this.store.selectedCompanyContext$.subscribe((company) => {
      this.company = company;
      this.messageService.add({severity: 'info', summary: 'OK', detail: 'Unternehmen wurde aktualisiert'});
      console.log('Company updated', company);
    });
  }
}
