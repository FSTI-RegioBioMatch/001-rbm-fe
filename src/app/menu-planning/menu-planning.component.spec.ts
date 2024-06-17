import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPlanningComponent } from './menu-planning.component';

describe('MenuPlanningComponent', () => {
  let component: MenuPlanningComponent;
  let fixture: ComponentFixture<MenuPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPlanningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
