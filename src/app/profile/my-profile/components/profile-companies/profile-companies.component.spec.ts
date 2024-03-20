import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCompaniesComponent } from './profile-companies.component';

describe('ProfileCompaniesComponent', () => {
  let component: ProfileCompaniesComponent;
  let fixture: ComponentFixture<ProfileCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileCompaniesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
