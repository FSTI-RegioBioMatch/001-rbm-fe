import { Component, OnInit } from '@angular/core';
import { OfferService } from './shared/services/offer.service';
import { AddressType } from './shared/types/address.type';
import { RequestService } from './shared/services/request.service';
import { forkJoin, of, switchMap, tap } from 'rxjs';
import { StoreService } from './shared/store/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'RegioBioMatch';

  constructor(
    private store: StoreService,
    private requestService: RequestService,
    private offerService: OfferService,
  ) {}

  ngOnInit(): void {
    this.store.initPersonMeInformation();
    community_season_calendar
    const observables = forkJoin({
      companyContext: this.store.selectedCompanyContext$.pipe(
        switchMap((company) => {
          if (company) {
            return this.requestService
              .doGetRequest(company.addresses[0].self)
              .pipe(
                tap((data) => {
                  this.store.selectedCompanyLatLonSubject.next({
                    lat: (data as AddressType).lat,
                    lon: (data as AddressType).lon,
                  });
                  this.offerService.setOffersBySearchRadius(
                    5,
                    data as AddressType,
                  );
                }),
              );
          } else {
            return of(null);
          }
        }),
      ),
    });
  //   const observables = forkJoin({
  //     companyContext: this.store.selectedCompanyContext$.pipe(
  //       switchMap((company) => {
  //         if (company) {
  //           return this.requestService
  //             .doGetRequest(company.addresses[0].self)
  //             .pipe(
  //               tap((data) => {
  //                 console.log(123213123312, data as AddressType);
  //                 this.store.selectedCompanyLatLonSubject.next({
  //                   lat: (data as AddressType).lat,
  //                   lon: (data as AddressType).lon,
  //                 });
  //                 this.offerService.setOffersBySearchRadius(
  //                   5,
  //                   data as AddressType,
  //                 );
  //               }),
  //             );
  //         } else {
  //           return of(null);
  //         }
  //       }),
  //     ),
  //   });
  //   observables.subscribe((data) => {
  //     console.log(data);
  //   });
  }

  //TODO 
  // implement the logic above seperately in service and in needed components
}
