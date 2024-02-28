import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';

@Component({
  selector: 'app-recipe-infomation-dialog',
  standalone: true,
  imports: [MatIcon, MatChipSet, MatChip],
  templateUrl: './recipe-information-dialog.component.html',
  styleUrl: './recipe-information-dialog.component.scss',
})
export class RecipeInformationDialogComponent {}
