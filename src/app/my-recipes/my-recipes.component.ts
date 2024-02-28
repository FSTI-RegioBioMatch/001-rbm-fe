import { Component, OnInit } from '@angular/core';
import { RecipeSearchToolbarComponent } from './components/recipe-search-toolbar/recipe-search-toolbar.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { Card } from './types/card';
import { MatDialog } from '@angular/material/dialog';
import { RecipeInformationDialogComponent } from './components/recipe-infomation-dialog/recipe-information-dialog.component';

@Component({
  selector: 'app-my-recipes',
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
  standalone: true,
  imports: [RecipeSearchToolbarComponent, RecipeCardComponent],
  providers: [],
})
export class MyRecipesComponent implements OnInit {
  cards: Card[] = [
    {
      name: 'Fancy banana',
      img: 'assets/food-picture.jpg',
    },
    {
      name: 'Borscht',
    },
    {
      name: 'Fancy banana',
      img: 'assets/food-picture.jpg',
    },
    {
      name: 'Borscht',
    },
    {
      name: 'Borscht',
    },
    {
      name: 'Borscht',
    },
    {
      name: 'Borscht',
    },
  ];

  constructor(public dialog: MatDialog) {}

  openRecipeDialog() {
    const dialogRef = this.dialog.open(RecipeInformationDialogComponent);
  }

  ngOnInit(): void {
    // this.dialog.open(RecipeInformationDialogComponent);
    const test = new Function(
      'if(1===1){' +
        'console.log(this.cards); ' +
        'return true' +
        '}' +
        'else{' +
        'return false' +
        '}',
    );
    console.log(this.caller(test()));
  }

  caller(name: any) {
    return name;
  }
}
