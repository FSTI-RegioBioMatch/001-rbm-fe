import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MapComponent } from './map/map.component';
import { CompanyStoreService } from '../shared/store/company.store.service';
import { RequestService } from '../shared/services/request.service';
import { AddressType } from '../shared/types/address.type';
import { load } from '@angular-devkit/build-angular/src/utils/server-rendering/esm-in-memory-loader/loader-hooks';

@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MapComponent,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;

  address!: AddressType;
  loading = true;

  constructor(
    private requestService: RequestService,
    private companyStoreService: CompanyStoreService,
  ) {}

  ngOnInit(): void {
    this.companyStoreService.selectedCompanyContext$.subscribe((company) => {
      if (company) {
        this.requestService
          .doGetRequest(company.addresses[0].self)
          .subscribe((data) => {
            console.log(data as AddressType);
            this.address = data as AddressType;
            this.loading = false;
          });
      }
    });
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }
}
