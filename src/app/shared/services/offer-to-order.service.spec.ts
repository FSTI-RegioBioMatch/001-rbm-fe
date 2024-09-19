import { TestBed } from '@angular/core/testing';

import { OfferToOrderService } from './offer-to-order.service';

describe('OfferToOrderService', () => {
  let service: OfferToOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferToOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
