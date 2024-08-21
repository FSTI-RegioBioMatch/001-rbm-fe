import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RequestService } from './request.service';
import { OfferService } from './offer.service';
import { AddressType } from '../types/address.type';
import { StoreService } from '../store/store.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(
    private requestService: RequestService,
    private store: StoreService,
    private offerService: OfferService
  ) {}

  fetchCompanyContextAndSetOffers(): Observable<any> {
    return this.store.selectedCompanyContext$.pipe(
      switchMap((company) => {
        if (company) {
          return this.requestService
            .doGetRequest(company.addresses[0].self)
            .pipe(
              tap((data) => {
                const address = data as AddressType;
                this.store.selectedCompanyLatLonSubject.next({
                  lat: address.lat,
                  lon: address.lon,
                });
                this.offerService.setOffersBySearchRadius(5, address);
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }
}
