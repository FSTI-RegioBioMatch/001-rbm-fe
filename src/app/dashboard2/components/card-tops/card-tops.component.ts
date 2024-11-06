import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-card-tops',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './card-tops.component.html',
  styleUrl: './card-tops.component.scss',
})
export class CardTopsComponent {
  topItems = {
    articles: [
      { name: 'Tomate', count: 156 },
      { name: 'Gurke', count: 143 },
      { name: 'Salat', count: 128 },
      { name: 'Kartoffeln', count: 115 },
      { name: 'Zwiebeln', count: 98 },
    ],
    recipes: [
      { name: 'Tomatensalat', count: 89 },
      { name: 'Gurkensalat', count: 76 },
      { name: 'Kartoffelsalat', count: 72 },
      { name: 'Zwiebelsuppe', count: 65 },
      { name: 'Gemüseeintopf', count: 58 },
    ],
    menus: [
      { name: 'Sommersalat', count: 45 },
      { name: 'Wintereintopf', count: 42 },
      { name: 'Frühlingsgemüse', count: 38 },
      { name: 'Herbstgerichte', count: 35 },
      { name: 'Festtagsmenü', count: 32 },
    ],
  };
}
