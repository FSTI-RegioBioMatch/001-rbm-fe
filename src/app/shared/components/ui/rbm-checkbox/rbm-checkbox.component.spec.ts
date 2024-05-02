import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RbmCheckboxComponent } from './rbm-checkbox.component';

describe('RbmCheckboxComponent', () => {
  let component: RbmCheckboxComponent;
  let fixture: ComponentFixture<RbmCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RbmCheckboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RbmCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
