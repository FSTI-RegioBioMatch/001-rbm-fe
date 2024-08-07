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
import { DialogModule } from 'primeng/dialog';  // Import DialogModule
import { TooltipModule } from 'primeng/tooltip'; // Import TooltipModule
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { RRule, Frequency } from 'rrule';
import { filter, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';  // Import uuid
import { EventHoveringArg, EventApi } from '@fullcalendar/core'; // Import necessary types

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
    DialogModule,  // Add DialogModule
    TooltipModule,  // Add TooltipModule
    FullCalendarModule
  ],
  templateUrl: './menu-planning.component.html',
  styleUrls: ['./menu-planning.component.scss'],
})
export class MenuPlanningComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  myRecipes: any[] = []; // contains found recipes
  filteredRecipes: any[] = []; // contains filtered recipes for search
  menuPlan: any[] = []; // stores selected recipes
  menuPlanForm: FormGroup; // form for creating a new menu plan
  searchQuery: string = '';
  events: any[] = []; // stores calendar events
  calendarOptions: any; // stores calendar options
  displayEventDialog: boolean = false;
  selectedEvent: any;

  weekDays = [
    { label: 'Montag', value: 1 }, // Changed to match moment.js ISO day format (1 is Monday)
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
    const menuUuid = uuidv4(); // Generate a UUID for the menu
    const nextExecution = menuPlanData.nachsteAusfuhrung;
    const weekNumber = parseInt(nextExecution.split(' ')[0].replace('KW', ''), 10);
    const year = parseInt(nextExecution.split(' ')[1], 10);

    const startDate = moment().year(year).isoWeek(weekNumber).isoWeekday(menuPlanData.wochentag);
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
          until: moment().year(year).endOf('year').toDate()
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
        id: menuUuid,
        title: menuPlanData.name,
        start: moment(date).startOf('day').toISOString(), // Ensure the date is in ISO format and set to start of day
        allDay: true, // Make it a full-day event
        extendedProps: {
          description: menuPlanData.description,
          location: menuPlanData.ort,
          portions: menuPlanData.portions,
          portionsVegetarisch: menuPlanData.portionsVegetarisch,
          portionsVegan: menuPlanData.portionsVegan,
          recipes: menuPlanData.recipes
        }
      });
    });

    // Update the calendar options to reflect the new events
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
      editable: true,
      droppable: true,
      events: this.events,
      eventMouseEnter: (info: EventHoveringArg) => {
        info.el.setAttribute('pTooltip', `
          <strong>${info.event.title}</strong><br>
          <em>${info.event.extendedProps['description']}</em><br>
          Location: ${info.event.extendedProps['location']}<br>
          Portions: ${info.event.extendedProps['portions']}<br>
          Vegetarian Portions: ${info.event.extendedProps['portionsVegetarisch']}<br>
          Vegan Portions: ${info.event.extendedProps['portionsVegan']}<br>
        `);
        info.el.setAttribute('tooltipPosition', 'top');
        info.el.setAttribute('tooltipEvent', 'hover');
      },
      eventClick: (info: EventHoveringArg) => {
        this.selectedEvent = info.event;
        this.displayEventDialog = true;
      }
    };
  }

  updateCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      console.log('Refetching events');
      this.calendarComponent.getApi().refetchEvents();
    }
  }
}
