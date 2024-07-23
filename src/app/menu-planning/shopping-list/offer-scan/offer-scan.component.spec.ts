import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferScanComponent } from './offer-scan.component';

describe('OfferScanComponent', () => {
  let component: OfferScanComponent;
  let fixture: ComponentFixture<OfferScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferScanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OfferScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
