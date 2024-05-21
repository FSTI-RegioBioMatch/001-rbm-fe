import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  markers: L.Marker[] = [
    L.marker([49.14844742446603, 9.215238773312953]), // hn
  ];

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.initializeMap();
    this.addMarkers();
    this.centerMap();
  }

  private initializeMap() {
    const baseMapURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayerOptions = {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      errorTileUrl: 'https://{s}.tile.openstreetmap.org/404.png'
    };

    this.map = L.map('map').setView([49.14844742446603, 9.215238773312953], 8);

    L.tileLayer(baseMapURL, tileLayerOptions).addTo(this.map).on('tileerror', (error) => {
      console.error('Tile loading error:', error);
    });
  }

  private addMarkers() {
    this.markers.forEach(marker => marker.addTo(this.map));
  }

  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    this.map.fitBounds(bounds);
  }
}
