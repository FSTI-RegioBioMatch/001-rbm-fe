import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { OfferType } from '../../types/offer.type';

@Injectable({
  providedIn: 'root',
})
export class NearbuyOfferService {
  //offers?limit=1000&lat1=51.1393072431761&lon1=9.189950918907227&lat2=51.4986333568239&lon2=9.764888681092772&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT

  constructor(private http: HttpClient) {}

  /**
   * Gets offers by radius.
   * Should work with the geo.service.ts to calculate the bounding box.
   *
   * @param startLat The starting latitude. Basically company location.
   * @param startLon The starting longitude. Basically company location.
   * @param endLat The ending latitude.
   * @param endLon The ending longitude.
   * @returns The offers.
   */
  getOffersByRadius(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ) {
    return this.http.get<OfferType[]>(
      environment.NEARBUY_API +
        `/offers?limit=1000&lat1=${startLat}&lon1=${startLon}&lat2=${endLat}&lon2=${endLon}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`,
    );
  }
}
