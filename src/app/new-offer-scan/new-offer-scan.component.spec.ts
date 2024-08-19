import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOfferScanComponent } from './new-offer-scan.component';

describe('NewOfferScanComponent', () => {
  let component: NewOfferScanComponent;
  let fixture: ComponentFixture<NewOfferScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOfferScanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewOfferScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
