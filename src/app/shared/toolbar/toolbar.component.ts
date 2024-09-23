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
import { MenubarModule } from 'primeng/menubar';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ToolbarMenuService } from '../services/toolbarmenu.service';
import { CommonModule } from '@angular/common';


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
    MenubarModule,
    TooltipModule,
    AvatarModule,
    AvatarGroupModule,
    CommonModule,
  ],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  burgerMenuActive: boolean = true;
  menuItems: MenuItem[] = [];
  private routerSubscription: Subscription | undefined;
  private burgerMenuSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private menuService: ToolbarMenuService,
  ) {}

  ngOnInit(): void {
    this.initializeMenu();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveMenuItem();
      });

    this.burgerMenuSubscription = this.menuService.burgerMenuState$.subscribe(state => {
      this.burgerMenuActive = state;
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.burgerMenuSubscription) {
      this.burgerMenuSubscription.unsubscribe();
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
        label: 'Bestellungen',
        icon: 'pi pi-fw pi-shopping-cart',
        routerLink: '/orders',
      },
      {
        label: 'Marktplatz',
        icon: 'pi pi-fw pi-shopping-cart',
        routerLink: '',
      },
      {
        label: 'Bereich xy',
        icon: 'pi pi-fw pi-cog',
        routerLink: '',
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
  goToProfileSelf()
  {
    this.router.navigate(['/my-profile']);
  }
}
