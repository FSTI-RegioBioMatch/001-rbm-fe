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

  // fetchCompanyContextAndSetOffers(): Observable<any> {
  //   return this.store.selectedCompanyContext$.pipe(
  //     switchMap((company) => {
  //       if (company && company.addresses && company.addresses.length > 0) {
  //         // Fetch the address from the company's first address URL
  //         return this.requestService
  //           .doGetRequest(company.addresses[0].self)
  //           .pipe(
  //             tap((data) => {
  //               const address = data as AddressType;
  //               this.store.selectedCompanyLatLonSubject.next({
  //                 lat: address.lat,
  //                 lon: address.lon,
  //               });
  //               // Set the address in the OfferService to make it available for offer fetching
  //               this.offerService.setAddress(address);
  //               // Fetch offers using the newly set address
  //               this.offerService.setOffersBySearchRadius(5, address);
  //             })
  //           );
  //       } else {
  //         return of(null); // Handle case where company has no address
  //       }
  //     })
  //   );
  // }
}
