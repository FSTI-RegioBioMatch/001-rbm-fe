import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ToolbarMenuService } from '../shared/services/toolbarmenu.service';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';
import { TieredMenuModule, TieredMenu  } from 'primeng/tieredmenu';
import { an } from '@fullcalendar/core/internal-common';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule,
    TieredMenuModule,
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {

  constructor(private menuService: ToolbarMenuService) {}

  ngOnInit() {
    this.menuService.setBurgerMenuState(window.innerWidth < 1000);
  }

  ngOnDestroy() {
    this.menuService.setBurgerMenuState(true);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 1000) {
      this.menuService.setBurgerMenuState(false);
    }
    else {
      this.menuService.setBurgerMenuState(true);
    }
  }

  showMenu(event: Event, menu: TieredMenu) {
    menu.show(event);
  }

  hideMenu(event: Event, menu: TieredMenu) {
    menu.hide(event);
  }


  navLinks = [
    { path: '/dashboard', class: 'pt-sidebar-home', icon: 'pi pi-home', label: 'Übersicht', subLinks: [
      { label: 'dings', path: '/menu-planning/my-menus', icon: 'pi pi-fw pi-list' },
    ]},
    { path: '/my-recipes', class: 'pt-sidebar-recipe', icon: 'pi pi-book', label: 'Meine Rezepte', related: ['/recipe-details/'] },
    { path: '/menu-planning/my-menus', class: 'pt-sidebar-menus', icon: 'pi pi-clipboard', label: 'Meine Menüs',  related: ['/menu-planning'] },
    { path: '/orders', class: 'pt-sidebar-orders', icon: 'pi pi-shopping-cart', label: 'Bestelllungen',  related: ['/offers-overview', '/pr-pi-overview'] },
    { path: '', class: 'pt-none', icon: 'pi pi-shop', label: 'Marktplatz' },
    { path: '', class: 'pt-none', icon: 'pi pi-objects-column', label: 'Bereich X Y' },
  ];

  hoverLink: any = null;

  // Methode, um den aktiven Link zu bestimmen
  isActive(link: string): boolean {
    const currentPath = window.location.pathname;
    const navLink = this.navLinks.find(nav => nav.path === link);
    
    if (navLink) {
      if (navLink.path === currentPath) {
        return true;
      }
      if (navLink.related) {
        return navLink.related.some(relatedPath => currentPath.startsWith(relatedPath));
      }
    }
    
    return false;
  }
}