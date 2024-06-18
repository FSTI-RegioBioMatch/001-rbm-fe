import { Component, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';

@Component({
  selector: 'app-menu-planning',
  standalone: true,
  imports: [MatTabGroup, MatTab, ManageMenuComponent],
  templateUrl: './menu-planning.component.html',
  styleUrl: './menu-planning.component.scss',
})
export class MenuPlanningComponent implements OnInit {
  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.store.selectedPublicRecipe$.subscribe((recipe) => {
      console.log('stored recipes', recipe);
    });
  }
}
