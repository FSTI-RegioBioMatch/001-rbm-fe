import { Component, Input, OnInit } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { AddressType } from '../../../shared/types/address.type';
import { OfferService } from '../../../shared/offer.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-near-offers-card',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatCardTitle, JsonPipe],
  templateUrl: './near-offers-card.component.html',
  styleUrl: './near-offers-card.component.scss',
})
export class NearOffersCardComponent implements OnInit {
  constructor(public offerService: OfferService) {}

  ngOnInit(): void {}
}
