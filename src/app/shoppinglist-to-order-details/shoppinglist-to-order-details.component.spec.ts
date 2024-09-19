import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistToOrderDetailsComponent } from './shoppinglist-to-order-details.component';

describe('ShoppinglistToOrderDetailsComponent', () => {
  let component: ShoppinglistToOrderDetailsComponent;
  let fixture: ComponentFixture<ShoppinglistToOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppinglistToOrderDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppinglistToOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
