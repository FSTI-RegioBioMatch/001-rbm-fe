import { TestBed } from '@angular/core/testing';

import { NearbuyTestService } from './nearbuy-test.service';

describe('NearbuyTestService', () => {
  let service: NearbuyTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NearbuyTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
