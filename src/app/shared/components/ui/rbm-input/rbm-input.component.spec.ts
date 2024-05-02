import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RbmInputComponent } from './rbm-input.component';

describe('RbmInputComponent', () => {
  let component: RbmInputComponent;
  let fixture: ComponentFixture<RbmInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RbmInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RbmInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
