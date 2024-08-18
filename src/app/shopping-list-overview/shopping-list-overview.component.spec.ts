import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListOverviewComponent } from './shopping-list-overview.component';

describe('ShoppingListOverviewComponent', () => {
  let component: ShoppingListOverviewComponent;
  let fixture: ComponentFixture<ShoppingListOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
