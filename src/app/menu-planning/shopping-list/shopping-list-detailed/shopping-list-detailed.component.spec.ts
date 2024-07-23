import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListDetailedComponent } from './shopping-list-detailed.component';

describe('ShoppingListDetailedComponent', () => {
  let component: ShoppingListDetailedComponent;
  let fixture: ComponentFixture<ShoppingListDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListDetailedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
