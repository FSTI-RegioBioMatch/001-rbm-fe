import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ChangeCompanyDialogComponent } from '../components/change-company-dialog/change-company-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    DialogModule,
    InputTextModule,
    ButtonModule,
    MenuModule,
  ],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  menuItems: MenuItem[] = [];
  private routerSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.initializeMenu();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveMenuItem();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Übersicht',
        icon: 'pi pi-fw pi-home',
        routerLink: '/dashboard',
      },
      {
        label: 'Rezepte',
        icon: 'pi pi-fw pi-book',
        routerLink: '/my-recipes',
      },
      {
        label: 'Menüplanung',
        icon: 'pi pi-fw pi-calendar',
        routerLink: '/menu-planning',
      },
      {
        label: 'Marktplatz',
        icon: 'pi pi-fw pi-shopping-cart',
        routerLink: '/recipes',
      },
      {
        label: 'Bereich xy',
        icon: 'pi pi-fw pi-cog',
        routerLink: '/recipes',
      },
    ];
  }

  updateActiveMenuItem(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach((item) => {
      item.styleClass =
        item.routerLink === currentUrl ? 'active-menu-item' : '';
    });
  }

  onClickOpenChangeCompanyDialog(): void {
    const dialogRef = this.dialogService.open(ChangeCompanyDialogComponent, {
      header: 'Firma wechseln',
      width: '40%',
      height: '30%',
    });
  }
  goToHome() {
    this.router.navigate(['/dashboard']);
  }
}
