import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Icon, IconOptions } from 'leaflet';
import { OfferType } from '../../shared/types/offer.type';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnChanges, AfterViewInit {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() offers: OfferType[] = [];

  private map!: L.Map;
  private markers!: L.Marker[];
  private customMarker: L.Marker | null = null;

  constructor() {}

  ngAfterViewInit() {
    this.initializeMap(); 
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Changes detected:', changes);
    if (changes['offers'] && !changes['offers'].firstChange) {
      console.log('Offers changed in MapComponent:', this.offers);
      this.updateMarkers();
    }
    if ((changes['lat'] || changes['lng']) && this.map) {
      this.updateMapCenter();
    }
  }
  
  private updateMapCenter() {
    if (this.lat !== undefined && this.lng !== undefined && this.map) {
      this.map.setView([this.lat, this.lng], this.map.getZoom());
      this.addCustomMarker(); // Update custom marker position
    }
  }

  private initializeMap() {
    console.log('Initializing map with lat:', this.lat, 'lng:', this.lng);
    if (this.lat && this.lng) {
      if (this.map) {
        this.map.remove();
      }
      this.map = L.map('map').setView([this.lat, this.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.addCustomMarker();
      this.updateMarkers();
      
    } else {
      console.error('Latitude and Longitude are not provided for map initialization');
    }
  }

  private updateMarkers() {
    console.log('Updating markers. Number of offers:', this.offers.length);
    if (!this.map) {
      console.error('Map is not initialized');
      return;
    }
    
    // Clear existing markers
    if (this.markers) {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
      } else {
    console.warn('Markers array is not initialized');
    this.markers = [];
      }

    // Add new markers for each offer
    if (this.offers && this.offers.length > 0) {
      this.offers.forEach((offer, index) => {
        console.log(`Processing offer ${index}:`, offer);
        if (offer.address && offer.address.lat && offer.address.lon) {
          const marker = L.marker([offer.address.lat, offer.address.lon]).addTo(this.map);
          const popupContent = `
            <b>${offer.company.name}</b><br>
            ${offer.company.label}<br>
            Product: ${offer.ontoFoodType?.label}<br>
            Amount: ${offer.product.totalAmount} ${offer.product.unit}<br>
            From: ${offer.product.dateStart}<br>
            To: ${offer.product.dateEnd}
          `;
          marker.bindPopup(popupContent);
          this.markers.push(marker);
          console.log(`Added marker for offer ${index} at:`, offer.address.lat, offer.address.lon);
        } else {
          console.warn(`Offer ${index} has invalid coordinates:`, offer.address);
        }
      });
      this.centerMap();
    } else {
      console.warn('No offers to display');
    }
  }

  private centerMap() {
    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map((marker) => marker.getLatLng())
      );
      this.map.fitBounds(bounds);
    }
  }

  private createCustomIcon(iconUrl?: string): Icon<IconOptions> {
    return L.icon({
      iconUrl: iconUrl || 'assets/leaflet/marker-icon.png',
      iconRetinaUrl: iconUrl || 'assets/leaflet/marker-icon-2x.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [30, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
  }

  private addCustomMarker() {
    if (this.customMarker) {
      this.map.removeLayer(this.customMarker);
    }
    const customIcon = this.createCustomIcon('assets/leaflet/OwnLoc_marker.png');
    this.customMarker = L.marker([this.lat, this.lng], { icon: customIcon }).addTo(this.map);
    this.customMarker.bindPopup('<b>Mein Standort</b>').openPopup();
    console.log('Added custom marker for my location at:', this.lat, this.lng);
  }
}
