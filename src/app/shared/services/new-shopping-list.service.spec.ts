import { TestBed } from '@angular/core/testing';

import { NewShoppingListService } from './new-shopping-list.service';

describe('NewShoppingListService', () => {
  let service: NewShoppingListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewShoppingListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
