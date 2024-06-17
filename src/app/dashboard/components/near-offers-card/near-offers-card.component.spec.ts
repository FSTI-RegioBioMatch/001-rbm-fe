import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearOffersCardComponent } from './near-offers-card.component';

describe('NearOffersCardComponent', () => {
  let component: NearOffersCardComponent;
  let fixture: ComponentFixture<NearOffersCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NearOffersCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NearOffersCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
