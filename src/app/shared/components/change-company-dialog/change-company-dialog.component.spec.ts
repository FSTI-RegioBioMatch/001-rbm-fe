import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCompanyDialogComponent } from './change-company-dialog.component';

describe('ChangeCompanyDialogComponent', () => {
  let component: ChangeCompanyDialogComponent;
  let fixture: ComponentFixture<ChangeCompanyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeCompanyDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeCompanyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
