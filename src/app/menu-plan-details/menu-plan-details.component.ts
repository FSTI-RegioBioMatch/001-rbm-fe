import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../shared/store/store.service';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-menu-plan-details',
  standalone: true,
  templateUrl: './menu-plan-details.component.html',
  styleUrls: ['./menu-plan-details.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
})
export class MenuPlanDetailsComponent implements OnInit {
  menuPlan: any | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private menuplanService: NewMenuplanService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
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
        this.loading = false;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch menu plan details' });
        this.loading = false;
        console.error('Failed to fetch menu plan details:', error);
      }
    );
  }
}
