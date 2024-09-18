import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrPiOverviewComponent } from './pr-pi-overview';

describe('pr-pi-overviewComponent', () => {
  let component: PrPiOverviewComponent;
  let fixture: ComponentFixture<PrPiOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrPiOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrPiOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
