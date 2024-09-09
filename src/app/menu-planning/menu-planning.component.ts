import { Component, OnInit, ViewChild } from '@angular/core';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment/moment';
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
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { RRule, Frequency, Weekday } from 'rrule';
import { filter, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { EventHoveringArg, EventApi } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { CustomValidators } from '../shared/validators/custom-validators'; 
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { SidebarComponent } from '../sidebar/sidebar.component';

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
    ToastModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    TabViewModule,
    TooltipModule,
    MessageModule,
    SidebarComponent,
  ],
  providers: [MessageService, ConfirmationService],
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
  addedRecipes: Set<any> = new Set();

  currentPage: number = 0;
  pageSize: number = 20;
  totalElements: number = 0;
  loading: boolean = false;
  allLoaded: boolean = false; // to track if all recipes are loaded

  calendarLoaded = false
  recipesLoaded = false

  activeIndex: number = 0;
  visible: boolean = false;

  constructor(
    private store: StoreService,
    private menuplanService: NewMenuplanService,
    private recipeService: RecipeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.menuPlanForm = new FormGroup({
      name: new FormControl('', Validators.required),
      nachsteAusfuhrung: new FormControl('', Validators.required),
      wochentag: new FormControl('', Validators.required),
      wiederholung: new FormControl('', Validators.required),
      ort: new FormControl('', Validators.required),
      portions: new FormControl( 0, [Validators.required, Validators.min(0)]),
      portionsVegetarisch: new FormControl(0, [Validators.required, Validators.min(0)]),
      portionsVegan: new FormControl(0, [Validators.required, Validators.min(0)]),
      description: new FormControl('', CustomValidators.optionalMinLength(1)),
    }, {
      validators: [
        CustomValidators.atLeastOnePortion(['portions', 'portionsVegetarisch', 'portionsVegan']),
        CustomValidators.atLeastOneRecipe(() => this.menuPlan)
      ]
    });
  }
  
  onWheel(event: WheelEvent) {
    const container = event.currentTarget as HTMLElement;
    if (event.deltaY > 0) {
      container.scrollLeft += 100;
    } else {
      container.scrollLeft -= 100;
    }
    event.preventDefault();
  }

  isRecipeAdded(recipe: any): boolean {
    return this.addedRecipes.has(recipe);
  }

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

  ngOnInit(): void {
    this.recipesLoaded = false
    this.calendarLoaded = false
    this.calculateNextExecutionOptions();
    this.setupCalendarOptions();
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
      )
      .subscribe(() => {

        this.loadRecipes(); 
        this.loadAllEvents();
      });
  }

  showDialog() {
    this.visible = true;
  }
  

  loadRecipes(reset: boolean = false): void {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
  
    if (reset) {
      this.currentPage = 0;
      this.filteredRecipes = [];
    }
  
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(
            this.currentPage,
            this.pageSize,
            'recipeName,asc',
            this.searchQuery
          )
        )
      )
      .subscribe(
        page => {
          // Append or reset the filtered recipes based on the reset flag
          if (reset) {
            this.filteredRecipes = [...page.content];
          } else {
            this.filteredRecipes = [...this.filteredRecipes, ...page.content];
          }
          this.recipesLoaded = true
          
          this.totalElements = page.totalElements;
          this.currentPage++;
          this.loading = false;
  
          // Check if all pages are loaded
          if (this.filteredRecipes.length >= this.totalElements) {
            this.allLoaded = true;
          }
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching recipes' });
          console.error('Error fetching recipes:', error);
          this.loading = false;
          this.recipesLoaded = true
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
    this.loading = false;
    this.allLoaded = false;
    this.currentPage = 0;
    this.loadRecipes(true); // Reset and load the filtered recipes
  }

  addRecipeToMenuPlan(recipe: any): void {
    if (this.addedRecipes.has(recipe)) {
      this.addedRecipes.delete(recipe);
    } else {
      this.addedRecipes.add(recipe);
    }
    if (this.menuPlan.includes(recipe)) {
      return;
    }
    this.menuPlan.push(recipe);
    this.menuPlanForm.updateValueAndValidity(); // Update form validity
  }
  
  removeRecipeFromMenuPlan(recipe: any): void {
    const index = this.menuPlan.indexOf(recipe);
    if (this.addedRecipes.has(recipe)) {
      this.addedRecipes.delete(recipe);
    } else {
      this.addedRecipes.add(recipe);
    }
    if (index > -1) {
      this.menuPlan.splice(index, 1);
    }
    this.menuPlanForm.updateValueAndValidity(); // Update form validity
  }

  saveMenuPlan(): void {
    if (this.menuPlanForm.invalid || this.menuPlan.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail:'Bitte mindestens ein Rezept hinzufügen' });
      return;
    }
    this.loading = true;
    this.menuPlanForm.disable();
    const menuPlanData = {
      ...this.menuPlanForm.value,
      recipes: this.menuPlan,
    };

    // Generate a new UUID for the menu plan
    const menuUuid = uuidv4();

    // Add events to the calendar
    this.addEventsToCalendar(menuPlanData, menuUuid);

    // Creating the menuPlanDataObject with the generated ID and events
    const menuPlanDataObject = {
      id: menuUuid,
      name: menuPlanData.name,
      nextExecution: menuPlanData.nachsteAusfuhrung,
      weekday: menuPlanData.wochentag,
      repeatFrequency: menuPlanData.wiederholung,
      location: menuPlanData.ort,
      portions: menuPlanData.portions,
      portionsVegetarisch: menuPlanData.portionsVegetarisch,
      portionsVegan: menuPlanData.portionsVegan,
      description: menuPlanData.description,
      recipes: menuPlanData.recipes.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.recipeName,
      })),
      events: this.events.filter((e) => e.extendedProps.menuId === menuUuid).map((event) => ({
        id: event.id,
        start: event.start,
        allDay: event.allDay,
        description: event.extendedProps.description,
        location: event.extendedProps.location,
        portions: event.extendedProps.portions,
        portionsVegetarisch: event.extendedProps.portionsVegetarisch,
        portionsVegan: event.extendedProps.portionsVegan,
        repeatFrequency: event.extendedProps.repeatFrequency,
      })),
    };

    // Send to backend
    this.menuplanService.saveMenuPlan(menuPlanDataObject).subscribe(
      (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Menu Plan saved successfully!' });
        this.menuPlanForm.reset();
        this.menuPlanForm.enable();
        this.menuPlan = [];
        this.updateCalendar();
        this.loading = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error saving Menu Plan' });
        this.menuPlanForm.enable();
        this.loading = false;
        console.error('Error saving Menu Plan:', error);
      }
    );
  }

  addEventsToCalendar(menuPlanData: any, menuUuid: string): void {
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
          until: moment().year(year).endOf('year').toDate(),
        });
        break;
      case 'WEEKLY':
        rule = new RRule({
          freq: Frequency.WEEKLY,
          dtstart: startDate.toDate(),
          until: moment().year(year).endOf('year').toDate(),
        });
        break;
      case 'MONTHLY':
        rule = new RRule({
          freq: Frequency.MONTHLY,
          dtstart: startDate.toDate(),
          until: moment().year(year).endOf('year').toDate(),
          byweekday: [new Weekday(startDate.day() - 1)],
          bysetpos: [Math.ceil(startDate.date() / 7)],
        });
        break;
      case 'YEARLY':
        rule = new RRule({
          freq: Frequency.YEARLY,
          dtstart: startDate.toDate(),
          until: moment().year(year).endOf('year').toDate(),
        });
        break;
      default:
        return;
    }

    const dates = rule.all();
    dates.forEach((date) => {
      this.events.push({
        id: uuidv4(),
        title: menuPlanData.name,
        start: moment(date).startOf('day').toISOString(),
        allDay: true,
        extendedProps: {
          description: menuPlanData.description,
          location: menuPlanData.ort,
          portions: menuPlanData.portions,
          portionsVegetarisch: menuPlanData.portionsVegetarisch,
          portionsVegan: menuPlanData.portionsVegan,
          repeatFrequency: menuPlanData.wiederholung,
          menuId: menuUuid,
        },
      });
    });

    this.calendarOptions.events = [...this.events];
  }

  setupCalendarOptions(): void {
    this.calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
        firstDay: 1,
        editable: true,
        droppable: true,
        events: this.events,
        locale: deLocale,
        eventResizableFromStart: false,
        eventDurationEditable: false,
        eventClick: (info: EventHoveringArg) => {
            this.selectedEvent = info.event;
            this.displayEventDialog = true;
        },
        eventDrop: this.handleEventDrop.bind(this),

        // Highlight weekends
        weekends: true, // Ensures weekends are shown in the calendar
        businessHours: false, // Not relevant for menu planning, keeps the whole week visible

        // Setting a fixed height for the calendar to make it consistent across views
        height: 'auto', // Adjust to the container automatically

        // Limiting the number of events displayed per day to improve readability
        dayMaxEvents: 10, // Collapses additional events into a +N more link

        // Display event titles in full
        eventDisplay: 'block', // Ensures the event titles are fully displayed in the day cells

        // Adjusting the day names to a shorter format for better readability
        dayHeaderFormat: { weekday: 'short' }, // Shows 'Mon', 'Tue', etc.

        // Disabling event time to focus on date only
        displayEventTime: false, // Hides the time in event display

        customButtons: {
            exportButton: {
                text: 'Export',
                click: () => {
                    alert('Exporting calendar!');
                }
            }
        },
        headerToolbar: {
            left: 'prev,next today exportButton',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }
    };
}


  handleEventDrop(eventDropInfo: any): void {
    const updatedEvent = eventDropInfo.event;
    const menuId = updatedEvent.extendedProps.menuId;

    const updatedEventData = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        start: updatedEvent.start?.toISOString(),
        allDay: updatedEvent.allDay,
        description: updatedEvent.extendedProps.description,
        location: updatedEvent.extendedProps.location,
        portions: updatedEvent.extendedProps.portions,
        portionsVegetarisch: updatedEvent.extendedProps.portionsVegetarisch,
        portionsVegan: updatedEvent.extendedProps.portionsVegan,
        repeatFrequency: updatedEvent.extendedProps.repeatFrequency,
        menuId: menuId,
    };

    this.menuplanService.updateEventInMenuPlan(menuId, updatedEventData.id, updatedEventData).subscribe(
        (response) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event updated successfully!' });
            this.updateCalendar();
        },
        (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating event' });
            console.error('Error updating event:', error);
            eventDropInfo.revert();
        }
    );
  }

  confirmDelete(message: string, onAccept: () => void): void {
    this.confirmationService.confirm({
      message: message,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: onAccept,
      reject: () => {},
    });
  }
  

  deleteSingleEvent(event: EventApi): void {
    this.confirmDelete("Are you sure you want to delete this event?", () => {
      const eventId = event.id;
      const menuId = event.extendedProps['menuId'];
      this.events = this.events.filter(e => e.id !== eventId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteEventFromMenuPlan(menuId, eventId).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event deleted successfully!' });
          this.updateCalendar();
          this.displayEventDialog = false;
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error deleting event' });
          console.error('Error deleting event:', error);
        }
      );
    });
  }
  
  deleteAllEvents(menuId: string): void {
    this.confirmDelete("Are you sure you want to delete all events in this menu plan? Doing so will also delete the menu plan.", () => {
      this.events = this.events.filter(e => e.extendedProps['menuId'] !== menuId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteMenuPlan(menuId).subscribe(
        () => {

          this.updateCalendar();
          this.displayEventDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Menu Plan deleted successfully!' });
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error deleting Menu Plan' });
          console.error('Error deleting Menu Plan:', error);
        }
      );
    });
  }
  

  updateCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      this.loadAllEvents();
      this.calendarComponent.getApi().refetchEvents();
    }
  }

  loadAllEvents(): void {
    this.menuplanService.getAllMenuPlans().subscribe(
      (menuPlans) => {
        this.events = [];
        menuPlans.forEach((menuPlan) => {
          menuPlan.events.forEach((event: { id: any; start: moment.MomentInput; description: any; location: any; portions: any; portionsVegetarisch: any; portionsVegan: any; repeatFrequency: any; }) => {
            this.events.push({
              id: event.id,
              title: menuPlan.name,
              start: moment(event.start).toISOString(),
              allDay: true,
              extendedProps: {
                description: event.description,
                location: event.location,
                portions: event.portions,
                portionsVegetarisch: event.portionsVegetarisch,
                portionsVegan: event.portionsVegan,
                repeatFrequency: event.repeatFrequency,
                menuId: menuPlan.id,
              },
            });
          });
        });
        this.calendarOptions.events = [...this.events];
        this.calendarLoaded = true
      },
      (error) => {
        this.calendarLoaded = true
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching menu plans' });
        console.error('Error fetching menu plans:', error);
      }
    );
  }
}
