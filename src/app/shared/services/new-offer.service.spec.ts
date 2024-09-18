import { TestBed } from '@angular/core/testing';

import { NewOfferService } from './new-offer.service';

describe('NewOfferService', () => {
  let service: NewOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
