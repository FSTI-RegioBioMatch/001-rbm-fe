import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPlansComponent } from './menu-plans.component';

describe('MenuPlansComponent', () => {
  let component: MenuPlansComponent;
  let fixture: ComponentFixture<MenuPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPlansComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
