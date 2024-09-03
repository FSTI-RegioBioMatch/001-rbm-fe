import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPlanDetailsComponent } from './menu-plan-details.component';

describe('MenuPlanDetailsComponent', () => {
  let component: MenuPlanDetailsComponent;
  let fixture: ComponentFixture<MenuPlanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPlanDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
