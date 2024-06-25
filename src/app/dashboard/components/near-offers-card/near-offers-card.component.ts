import { Component, OnInit } from '@angular/core';
import { OfferService } from '../../../shared/services/offer.service';
import { JsonPipe } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-near-offers-card',
  standalone: true,
  imports: [JsonPipe, CardModule],
  templateUrl: './near-offers-card.component.html',
  styleUrl: './near-offers-card.component.scss',
})
export class NearOffersCardComponent implements OnInit {
  constructor(public offerService: OfferService) {}

  ngOnInit(): void {}
}
