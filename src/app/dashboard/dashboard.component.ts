import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MapComponent } from "./map/map.component";
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import { MatDialog } from '@angular/material/dialog';
import { RecepieDetailsDialogComponent } from './recepie-details-dialog/recepie-details-dialog.component';
import { GustarService } from '../shared/services/gustar.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

export enum UserType {
  Erzeuger = 'Erzeuger',
  Veredler = 'Veredler',
  User = 'User'
}

@Component({
    selector: 'app-new-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [MatGridListModule, MatCardModule, MatButtonModule, MatIconModule, MatButtonToggleModule, MapComponent]
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;

  userType: UserType = UserType.Veredler;
  searchData: any;

  constructor(private gustarService: GustarService, private mealdbservice: TheMealDbService, private dialog: MatDialog) { }

  ngOnInit() {
    this.gustoRecipes();
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }

  openDetails(meal: any) {
    this.dialog.open(RecepieDetailsDialogComponent, {
      data: { meal }
    });
  }

  gustoRecipes() {
    this.gustarService.searchRecipes('Käse').subscribe((searchData) => {
      console.log('Search Results:', searchData);
      this.searchData = searchData;
    });
  }
}
