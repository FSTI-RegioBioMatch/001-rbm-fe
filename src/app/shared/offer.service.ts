import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { OfferType } from './types/offer.type';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  constructor(private http: HttpClient) {}

  getOffers(lon1: number, lat1: number, lon2: number, lat2: number) {
    return this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`,
    );
  }
}
