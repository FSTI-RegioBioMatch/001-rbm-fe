import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment/moment';
import { MenuplanService } from '../shared/services/menuplan.service';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { JsonPipe } from '@angular/common';
import { RecipeService } from '../shared/services/recipe.service';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { RRule, Frequency, Weekday } from 'rrule';
import { filter, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { EventHoveringArg, EventApi } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';

@Component({
  selector: 'app-menu-planning',
  standalone: true,
  imports: [
    ManageMenuComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TableModule,
    JsonPipe,
    InputTextModule,
    FloatLabelModule,
    DropdownModule,
    InputTextareaModule,
    CommonModule,
    ButtonModule,
    FullCalendarModule,
    DialogModule,
    TooltipModule
  ],
  templateUrl: './menu-planning.component.html',
  styleUrls: ['./menu-planning.component.scss'],
})
export class MenuPlanningComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  myRecipes: any[] = [];
  filteredRecipes: any[] = [];
  menuPlan: any[] = [];
  menuPlanForm: FormGroup;
  searchQuery: string = '';
  events: any[] = [];
  calendarOptions: any;
  displayEventDialog: boolean = false;
  selectedEvent: any;

  weekDays = [
    { label: 'Montag', value: 1 },
    { label: 'Dienstag', value: 2 },
    { label: 'Mittwoch', value: 3 },
    { label: 'Donnerstag', value: 4 },
    { label: 'Freitag', value: 5 },
    { label: 'Samstag', value: 6 },
    { label: 'Sonntag', value: 0 },
  ];

  nextExecutionOptions: any[] = [];
  repeatOptions = [
    { label: 'Täglich', value: 'DAILY' },
    { label: 'Wöchentlich', value: 'WEEKLY' },
    { label: 'Monatlich', value: 'MONTHLY' },
    { label: 'Jährlich', value: 'YEARLY' },
  ];

  constructor(
    private store: StoreService,
    private menuplanService: MenuplanService,
    private recipeService: RecipeService,
  ) {
    this.menuPlanForm = new FormGroup({
      name: new FormControl('', Validators.required),
      nachsteAusfuhrung: new FormControl('', Validators.required),
      wochentag: new FormControl('', Validators.required),
      wiederholung: new FormControl('', Validators.required),
      ort: new FormControl('', Validators.required),
      portions: new FormControl('', Validators.required),
      portionsVegetarisch: new FormControl(''),
      portionsVegan: new FormControl(''),
      description: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.calculateNextExecutionOptions();
    this.setupCalendarOptions();

    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(0, 10, 'recipeName,asc')
        )
      )
      .subscribe(
        page => {
          this.myRecipes = page.content;
          this.filteredRecipes = this.myRecipes;
          console.log('recipes', this.myRecipes);
        },
        error => {
          console.error('Error fetching recipes:', error);
        }
      );
  }

  calculateNextExecutionOptions(): void {
    const today = moment();
    const currentWeek = today.isoWeek();
    const currentYear = today.year();

    for (let i = 0; i < 52; i++) {
      const week = currentWeek + i;
      const weekYear = week > 52 ? currentYear + 1 : currentYear;
      const displayWeek = week > 52 ? week - 52 : week;

      const weekLabel = `KW${displayWeek} ${weekYear}`;
      this.nextExecutionOptions.push({ label: weekLabel, value: weekLabel });
    }
  }

  filterRecipes(): void {
    this.filteredRecipes = this.myRecipes.filter(recipe =>
      recipe.recipeName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addRecipeToMenuPlan(recipe: any): void {
    if (this.menuPlan.includes(recipe)) {
      return;
    }
    this.menuPlan.push(recipe);
    console.log('menuPlan', this.menuPlan);
  }

  removeRecipeFromMenuPlan(recipe: any): void {
    const index = this.menuPlan.indexOf(recipe);
    if (index > -1) {
      this.menuPlan.splice(index, 1);
      console.log('menuPlan', this.menuPlan);
    }
  }

  saveMenuPlan(): void {
    const menuPlanData = {
      ...this.menuPlanForm.value,
      recipes: this.menuPlan
    };
    console.log('Menu Plan Data:', menuPlanData);

    // Add events to calendar
    this.addEventsToCalendar(menuPlanData);

    // Force calendar to update
    this.updateCalendar();
  }

  addEventsToCalendar(menuPlanData: any): void {
    const menuUuid = uuidv4();
    const nextExecution = menuPlanData.nachsteAusfuhrung;
    const weekNumber = parseInt(nextExecution.split(' ')[0].replace('KW', ''), 10);
    const year = parseInt(nextExecution.split(' ')[1], 10);

    const startDate = moment().year(year).isoWeek(weekNumber).isoWeekday(menuPlanData.wochentag); // Adjust weekday
    const repeatFrequency = menuPlanData.wiederholung;

    let rule: RRule;
    switch (repeatFrequency) {
        case 'DAILY':
            rule = new RRule({
                freq: Frequency.DAILY,
                dtstart: startDate.toDate(),
                until: moment().year(year).endOf('year').toDate()
            });
            break;
        case 'WEEKLY':
            rule = new RRule({
                freq: Frequency.WEEKLY,
                dtstart: startDate.toDate(),
                until: moment().year(year).endOf('year').toDate()
            });
            break;
        case 'MONTHLY':
            rule = new RRule({
                freq: Frequency.MONTHLY,
                dtstart: startDate.toDate(),
                until: moment().year(year).endOf('year').toDate(),
                byweekday: [new Weekday(startDate.day() - 1)], // Ensure correct weekday
                bysetpos: [Math.ceil(startDate.date() / 7)] // Ensure correct week within the month
            });
            break;
        case 'YEARLY':
            rule = new RRule({
                freq: Frequency.YEARLY,
                dtstart: startDate.toDate(),
                until: moment().year(year).endOf('year').toDate()
            });
            break;
        default:
            return;
    }

    const dates = rule.all();
    dates.forEach(date => {
        this.events.push({
            id: uuidv4(), // Unique identifier for each event instance
            menuId: menuUuid, // Identifier for the entire menu plan
            title: menuPlanData.name,
            start: moment(date).startOf('day').toISOString(),
            allDay: true,
            extendedProps: {
                description: menuPlanData['description'],
                location: menuPlanData['ort'],
                portions: menuPlanData['portions'],
                portionsVegetarisch: menuPlanData['portionsVegetarisch'],
                portionsVegan: menuPlanData['portionsVegan'],
                recipes: menuPlanData['recipes'],
                menuId: menuUuid,
                repeatFrequency: menuPlanData['wiederholung'] // Add repeat frequency to event details
            }
        });
    });

    this.calendarOptions.events = [...this.events];
  }

  setupCalendarOptions(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      firstDay: 1, // Set the first day of the week to Monday
      editable: true,
      droppable: true,
      events: this.events,
      locale: deLocale,
      eventClick: (info: EventHoveringArg) => {
        this.selectedEvent = info.event;
        this.displayEventDialog = true;
      }
    };
  }

  deleteSingleEvent(event: EventApi): void {
    this.events = this.events.filter(e => e.id !== event.id);
    this.calendarOptions.events = [...this.events];
    this.updateCalendar();
    this.displayEventDialog = false;
  }

  deleteAllEvents(menuId: string): void {
    this.events = this.events.filter(e => e.extendedProps.menuId !== menuId);
    this.calendarOptions.events = [...this.events];
    this.updateCalendar();
    this.displayEventDialog = false;
  }

  updateCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      console.log('Refetching events', this.events);
      this.calendarComponent.getApi().refetchEvents();
    }
  }
}
