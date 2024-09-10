import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCompanyComponent } from './card-company.component';

describe('CardCompanyComponent', () => {
  let component: CardCompanyComponent;
  let fixture: ComponentFixture<CardCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
