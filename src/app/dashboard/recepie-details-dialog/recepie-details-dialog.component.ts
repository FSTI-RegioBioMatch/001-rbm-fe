import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { catchError, switchMap, map, of } from 'rxjs';
import { GustarService } from '../../shared/services/gustar.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-recepie-details-dialog',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinner],
  templateUrl: './recepie-details-dialog.component.html',
  styleUrls: ['./recepie-details-dialog.component.scss']
})
export class RecepieDetailsDialogComponent implements OnInit {
  loading = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gustarService: GustarService
  ) { }

  ngOnInit(): void {
    this.fetchDetails();
  }

  fetchDetails(): void {
    this.gustarService.crawlRecipe(this.data.meal.source).pipe(
      switchMap(details => 
        this.gustarService.dietClassifier(details.ingredients).pipe(
          map(dietClassification => {
            this.data.meal.details = details;
            this.data.meal.dietClassification = dietClassification;
            this.loading = false;
            console.log('MealDetails:', this.data.meal);
          }),
          catchError(dietError => {
            console.error(`Error classifying diet for ${this.data.meal.source}`, dietError);
            this.data.meal.details = details;
            this.data.meal.dietClassification = {};
            this.loading = false;
            return of({});
          })
        )
      ),
      catchError(crawlError => {
        console.error(`Error fetching details for ${this.data.meal.source}`, crawlError);
        this.data.meal.details = {};
        this.data.meal.dietClassification = {};
        this.loading = false;
        return of({});
      })
    ).subscribe();
  }

}
