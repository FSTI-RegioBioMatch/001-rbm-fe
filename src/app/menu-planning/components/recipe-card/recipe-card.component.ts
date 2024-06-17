import { Component } from '@angular/core';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [MatButton, MatFabButton, MatIcon],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {}
