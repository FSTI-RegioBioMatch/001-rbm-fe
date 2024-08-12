import { TestBed } from '@angular/core/testing';

import { NewMenuplanService } from './new-menuplan.service';

describe('NewMenuplanService', () => {
  let service: NewMenuplanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewMenuplanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
