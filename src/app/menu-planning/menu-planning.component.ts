import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';

@Component({
  selector: 'app-menu-planning',
  standalone: true,
  imports: [MatTabGroup, MatTab, ManageMenuComponent],
  templateUrl: './menu-planning.component.html',
  styleUrl: './menu-planning.component.scss',
})
export class MenuPlanningComponent {}
