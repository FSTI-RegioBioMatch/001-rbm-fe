import { Component, ElementRef, ViewChild } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MapComponent } from "./map/map.component";
@Component({
    selector: 'app-new-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [MatGridListModule, MatCardModule, MatButtonModule, MatIconModule, MatButtonToggleModule, MapComponent]
})
export class DashboardComponent {
  @ViewChild('carousel') carousel!: ElementRef;

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }
}
