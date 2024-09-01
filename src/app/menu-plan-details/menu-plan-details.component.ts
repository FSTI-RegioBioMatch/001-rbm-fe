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
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No menu plan ID provided' });
      this.loading = false;
      return;
    }

    // Fetch the company ID from the store
    this.storeService.selectedCompanyContext$.pipe(take(1)).subscribe(company => {
      if (company && company.id) {
        this.fetchMenuPlanDetails(company.id, menuPlanId);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No company selected' });
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch menu plan details' });
        this.loading = false;
        console.error('Failed to fetch menu plan details:', error);
      }
    );
  }

  setupCalendarOptions(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      firstDay: 1,
      editable: true,
      droppable: true,
      events: this.events,
      locale: deLocale,
      eventClick: (info: EventHoveringArg) => {
        this.selectedEvent = info.event;
        this.displayEventDialog = true;
        console.log(this.selectedEvent)
      },
      eventDrop: this.handleEventDrop.bind(this)
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
        console.log('Event updated successfully:', response);
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
    this.confirmDelete("Are you sure you want to delete this event?", () => {
      const eventId = event.id;
      const menuId = event.extendedProps['menuId'];
      this.events = this.events.filter(e => e.id !== eventId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteEventFromMenuPlan(menuId, eventId).subscribe(
        () => {
          console.log(`Event ${eventId} deleted successfully`);
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
  
  deleteAllEvents(): void {
    let menuId = this.menuPlan.id
    this.confirmDelete("Wirklich den Menüplan löschen?", () => {
      this.events = this.events.filter(e => e.extendedProps['menuId'] !== menuId);
      this.calendarOptions.events = [...this.events];
      this.menuplanService.deleteMenuPlan(menuId).subscribe(
        () => {
          console.log(`Menu Plan ${menuId} and all its events deleted successfully`);
          this.updateCalendar();
          this.displayEventDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Menu Plan deleted successfully!' });
          setTimeout(() => {
            this.router.navigate(['/menu-planning']);
          }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error deleting Menu Plan' });
          console.error('Error deleting Menu Plan:', error);
        }
      );
    });
  }
}
