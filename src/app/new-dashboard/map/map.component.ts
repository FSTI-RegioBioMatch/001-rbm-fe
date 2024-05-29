import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  map!: L.Map;
  markers: L.Marker[] = [
    L.marker([49.14844742446603, 9.215238773312953]), // hn
  ];
  constructor() {}

  ngOnInit() {
    this.map = L.map('map').setView([49.14844742446603, 9.215238773312953], 20);

    this.initializeMap();
  }

  ngAfterViewInit() {
    this.addMarkers();
    this.centerMap();
  }

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
