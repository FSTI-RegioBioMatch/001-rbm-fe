import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { OfferType } from './types/offer.type';
import { OntofoodType } from './types/ontofood.type';
import { forkJoin } from 'rxjs';
import { RequestService } from './services/request.service';
import { GeoService } from './geo.service';
import { AddressType } from './types/address.type';
import { StoreService } from './store/store.service';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  constructor(
    private http: HttpClient,
    private requestService: RequestService,
    private geoService: GeoService,
    private store: StoreService,
  ) {}

  loaded = false;
  private ontoFoodTypes: OntofoodType[] = [];
  public displayedFoodTypes: OntofoodType[] = [];
  public address!: AddressType;

  getOffers(lon1: number, lat1: number, lon2: number, lat2: number) {
    return this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`,
    );
  }

  setOffersBySearchRadius(searchRadiusInKM: number, address: AddressType) {
    this.address = address;
    const boundingBox = this.geoService.getBoundingBox(
      searchRadiusInKM,
      address.lat,
      address.lon,
    );
    console.log(boundingBox);
    this.getOffers(
      boundingBox.lonMin,
      boundingBox.latMin,
      boundingBox.lonMax,
      boundingBox.latMax,
    ).subscribe((data) => {
      this.store.setOffers(data);
      const observables = data.map((offer) =>
        this.requestService.doGetRequest(offer.links.category),
      );

      forkJoin(observables).subscribe((responses) => {
        responses.forEach((response) => {
          const ontoFoodType = response as OntofoodType;
          // Only push if label does not exist in ontoFoodTypes
          if (
            !this.ontoFoodTypes.some(
              (type) => type.label === ontoFoodType.label,
            )
          ) {
            this.ontoFoodTypes.push(ontoFoodType);
          }
        });
        console.log(this.ontoFoodTypes);
        this.displayedFoodTypes = this.ontoFoodTypes.slice(0, 5);
        console.log(this.displayedFoodTypes);
        this.loaded = true;
        this.store.setOfferOntoFood(this.displayedFoodTypes);
      });
    });
  }
}
