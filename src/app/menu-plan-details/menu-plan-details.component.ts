import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../shared/store/store.service';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { filter, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import deLocale from '@fullcalendar/core/locales/de';
import { EventApi, EventHoveringArg } from 'fullcalendar';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import moment from 'moment';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-menu-plan-details',
  standalone: true,
  templateUrl: './menu-plan-details.component.html',
  styleUrls: ['./menu-plan-details.component.scss'],
  imports: [
    CommonModule,
    FullCalendarModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
})
export class MenuPlanDetailsComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  menuPlan: any | null = null;
  loading: boolean = true;
  calendarOptions: any;
  events: any[] = [];
  displayEventDialog: boolean = false;
  selectedEvent: any;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private menuplanService: NewMenuplanService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupCalendarOptions();
    this.checkStoreAndLoadMenuPlan();
  }

  private checkStoreAndLoadMenuPlan(): void {
    this.storeService.selectedCompanyContext$
      .pipe(filter(company => company !== null))
      .subscribe(() => {
        this.loadMenuPlan();
      });
  }

  private loadMenuPlan(): void {
    // Get the menu plan ID from route parameters
    const menuPlanId = this.route.snapshot.paramMap.get('id');

    if (!menuPlanId) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Keine ID für den Menüplan angegeben' });
      this.loading = false;
      return;
    }

    // Fetch the company ID from the store
    this.storeService.selectedCompanyContext$.pipe(take(1)).subscribe(company => {
      if (company && company.id) {
        this.fetchMenuPlanDetails(company.id, menuPlanId);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kein Unternehmen angegeben' });
        this.loading = false;
      }
    });
  }

  private fetchMenuPlanDetails(companyId: string, menuPlanId: string): void {
    this.menuplanService.getMenuPlanById(menuPlanId).subscribe(
      (menuPlan) => {
        this.menuPlan = menuPlan;
        this.events = menuPlan.events.map((event: any) => ({
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
        }));
        this.calendarOptions.events = [...this.events];
        this.loading = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Menüplandetails konnten nicht zugewiesen werden' });
        this.loading = false;
        console.error('Failed to fetch menu plan details:', error);
        setTimeout(() => {
          this.router.navigate(['/menu-planning/my-menus']);
        }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
      }
    );
  }

  setupCalendarOptions(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
      headerToolbar: {
        left: 'prev,next today exportButton',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
      firstDay: 1,
      weekNumbers: true,  // Enable week numbers
  weekNumberCalculation: 'ISO',  // Use ISO week numbers
  weekNumberFormat: { week: 'numeric' },  // Format the week number as numeric (optional)
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
      customButtons: {
        exportButton: {
            text: 'Export',
            click: () => {
                alert('Exporting calendar!');
            }
        }
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
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Einzelnes Menü wurde erfolgreich aktualisiert!' });
        this.updateCalendar();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Einzelnes Menü konnte nicht aktualisiert werden' });
        console.error('Error updating event:', error);
        eventDropInfo.revert();
      }
    );
  }

  updateCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      this.calendarComponent.getApi().refetchEvents();
    }
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
    let msg = ""
    let goBack = false
    if (this.events.length === 1) {
      msg = "Löschen des letzen Menus löscht auch den gesamten Menu plan. Menu wirklich löschen?"
      goBack = true
    } else {
      msg = "Einzelnes Menu wirklich löschen?"
    }
    this.confirmDelete(msg, () => {
      const eventId = event.id;
      const menuId = event.extendedProps['menuId'];
      this.events = this.events.filter(e => e.id !== eventId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteEventFromMenuPlan(menuId, eventId).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Einzelnes Menü wurde erfolgreich gelöscht!' });
          this.updateCalendar();
          this.displayEventDialog = false;
          if (goBack) {
            setTimeout(() => {
              this.router.navigate(['/menu-planning/my-menus']);
            }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
          }
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Einzelnes Menü konnte nicht gelöscht werden' });
          console.error('Error deleting event:', error);
        }
      );
    });
  }
  
  deleteAllEvents(): void {
    let menuId = this.menuPlan.id
    this.confirmDelete("Wirklich den Menüplan löschen?", () => {
      this.events = this.events.filter(e => e.extendedProps['menuId'] !== menuId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteMenuPlan(menuId).subscribe(
        () => {
          this.updateCalendar();
          this.displayEventDialog = false;
          this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Menüplan wurde erfolreich gelöscht!' });
          setTimeout(() => {
            this.router.navigate(['/menu-planning/my-menus']);
          }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Menüplan konnte nicht gelöscht werden' });
          console.error('Error deleting Menu Plan:', error);
        }
      );
    });
  }
}
