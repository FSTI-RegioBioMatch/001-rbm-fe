import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToolbarMenuService } from '../shared/services/toolbarmenu.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(private menuService: ToolbarMenuService) {}

  ngOnInit() {
    this.menuService.setBurgerMenuState(false);
  }

  ngOnDestroy() {
    this.menuService.setBurgerMenuState(true);
  }

  navLinks = [
    { path: '/dashboard', icon: 'pi pi-home', label: 'Übersicht' },
    { path: '/my-recipes', icon: 'pi pi-book', label: 'Meine Rezepte' },
    { path: '/menu-planning', icon: 'pi pi-clipboard', label: 'Meine Menüs' },
    { path: '', icon: 'pi pi-shop', label: 'Marktplatz' },
    { path: '', icon: 'pi pi-objects-column', label: 'Bereich X Y' },
  ];

  // Methode, um den aktiven Link zu bestimmen
  isActive(link: string): boolean {
    return window.location.pathname === link;
  }
}
