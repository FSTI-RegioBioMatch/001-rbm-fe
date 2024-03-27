import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockContextSwitchCompanyComponent } from './lock-context-switch-company.component';

describe('LockContextSwitchCompanyComponent', () => {
  let component: LockContextSwitchCompanyComponent;
  let fixture: ComponentFixture<LockContextSwitchCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LockContextSwitchCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LockContextSwitchCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
