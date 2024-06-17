import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  MatCalendar,
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';

@Component({
  selector: 'app-datepicker-with-weeks',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  templateUrl: './datepicker-with-weeks.component.html',
  styleUrl: './datepicker-with-weeks.component.scss',
})
export class DatepickerWithWeeksComponent implements AfterViewInit {
  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  ngAfterViewInit() {
    // Listen for the state changes of the calendar
    if (this.calendar) {
      this.calendar.stateChanges.subscribe(() => {
        this.addWeekNumbers();
      });
    }
  }

  onDatepickerOpen() {
    // Ensure week numbers are added when the datepicker opens
    setTimeout(() => {
      this.addWeekNumbers();
    });
  }

  addWeekNumbers() {
    const rows = document.querySelectorAll(
      '.custom-datepicker-panel .mat-calendar-body-row',
    );
    rows.forEach((row) => {
      if (!row.querySelector('.week-number')) {
        const weekNumberElement = document.createElement('div');
        weekNumberElement.classList.add('week-number');
        const dateElement = row.querySelector('.mat-calendar-body-cell');
        if (dateElement) {
          const date = new Date(dateElement.getAttribute('aria-label') || '');
          const weekNumber = this.getWeekNumber(date);
          weekNumberElement.textContent = weekNumber.toString();
          row.insertBefore(weekNumberElement, row.firstChild);
        }
      }
    });

    console.log(123123123, rows);
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
