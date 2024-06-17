import { TestBed } from '@angular/core/testing';

import { GustarService } from './gustar.service';

describe('GustarService', () => {
  let service: GustarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GustarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
