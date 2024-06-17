import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerWithWeeksComponent } from './datepicker-with-weeks.component';

describe('DatepickerWithWeeksComponent', () => {
  let component: DatepickerWithWeeksComponent;
  let fixture: ComponentFixture<DatepickerWithWeeksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerWithWeeksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatepickerWithWeeksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
