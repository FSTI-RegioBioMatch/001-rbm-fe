import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RbmSelectComponent } from './rbm-select.component';

describe('RbmSelectComponent', () => {
  let component: RbmSelectComponent;
  let fixture: ComponentFixture<RbmSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RbmSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RbmSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
