import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  @Input() lat!: number;
  @Input() lng!: number;

  map!: L.Map;
  markers!: L.Marker[];

  constructor() {}

  ngOnInit() {
    if (this.lat || this.lng) {
      this.markers = [
        L.marker([this.lat, this.lng]), // hn
      ];

      this.map = L.map('map').setView([this.lat, this.lng], 20);

      this.initializeMap();

      this.addMarkers();
      this.centerMap();
    }
  }

  ngAfterViewInit() {}

  private initializeMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private addMarkers() {
    this.markers.forEach((marker) => marker.addTo(this.map));
  }

  private centerMap() {
    const bounds = L.latLngBounds(
      this.markers.map((marker) => marker.getLatLng()),
    );
    this.map.fitBounds(bounds);
  }
}
