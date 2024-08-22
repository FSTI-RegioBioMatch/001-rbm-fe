import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonCalendarComponent } from './season-calendar.component';

describe('SeasonCalendarComponent', () => {
  let component: SeasonCalendarComponent;
  let fixture: ComponentFixture<SeasonCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeasonCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
