import { Component, Input, OnInit } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { CompanyStoreService } from '../../../shared/store/company.store.service';
import { AddressType } from '../../../shared/types/address.type';
import { GeoService } from '../../../shared/geo.service';
import { OfferService } from '../../../shared/offer.service';
import { RequestService } from '../../../shared/services/request.service';
import { OntofoodType } from '../../../shared/types/ontofood.type';
import { JsonPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-near-offers-card',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatCardTitle, JsonPipe],
  templateUrl: './near-offers-card.component.html',
  styleUrl: './near-offers-card.component.scss',
})
export class NearOffersCardComponent implements OnInit {
  @Input() searchRadiusInKM = 5;
  @Input() address!: AddressType;

  ontoFoodTypes: OntofoodType[] = [];
  displayedFoodTypes: OntofoodType[] = [];

  constructor(
    private geoService: GeoService,
    private offerService: OfferService,
    private requestService: RequestService,
  ) {}

  ngOnInit(): void {
    console.log(this.address);
    const boundingBox = this.geoService.getBoundingBox(
      this.searchRadiusInKM,
      this.address.lat,
      this.address.lon,
    );
    console.log(boundingBox);
    this.offerService
      .getOffers(
        boundingBox.lonMin,
        boundingBox.latMin,
        boundingBox.lonMax,
        boundingBox.latMax,
      )
      .subscribe((data) => {
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
        });
      });
  }
}
