import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import * as L from 'leaflet';
import { OfferType } from '../../../shared/types/offer.type';
import { CompanyType } from '../../../shared/types/company.type';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { StoreService, rbmRole } from '../../../shared/store/store.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  providers: [StoreService],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  // @Input() lat!: number;
  // @Input() lng!: number;
  // @Input() offers: OfferType[] = [];
  // @Input() companies: CompanyType[] = [];

  // private map!: L.Map;
  // private markers!: L.Marker[];
  // private customMarker: L.Marker | null = null;
  // private mapInitialized = false;

  // private latSubject = new BehaviorSubject<number>(0);
  // private lngSubject = new BehaviorSubject<number>(0);
  // private offersSubject = new BehaviorSubject<OfferType[]>([]);
  // private companiesSubject = new BehaviorSubject<CompanyType[]>([]);

  // private subscription: Subscription = new Subscription();

  // private markerColors: { [key: string]: { color: string; label: string } } = {
  //   refiner: { color: '#ff0000', label: 'Veredler' },
  //   producer: { color: '#00ff00', label: 'Erzeuger' },
  //   gastro: { color: '#0000ff', label: 'Gastronom' },
  //   offer: { color: '#000000', label: 'Angebot' },
  //   myLocation: { color: '#800080', label: 'Mein Standort' },
  //   default: { color: '#808080', label: 'Sonstige' },
  // };

  // constructor(private storeService: StoreService) {}

  // ngAfterViewInit() {
  //   this.initializeMap();
  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('MapComponent ngOnChanges', changes);
  //   if (changes['lat']) this.latSubject.next(this.lat);
  //   if (changes['lng']) this.lngSubject.next(this.lng);
  //   if (changes['offers']) this.offersSubject.next(this.offers || []);
  //   if (changes['companies']) this.companiesSubject.next(this.companies || []);
  // }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  // private initializeMap() {
  //   console.log('Initializing map', this.lat, this.lng);
  //   if (this.lat && this.lng) {
  //     this.map = L.map('map').setView([this.lat, this.lng], 13);
  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '© OpenStreetMap contributors',
  //     }).addTo(this.map);

  //     this.mapInitialized = true;
  //     this.addCustomMarker();
  //     this.addLegend();
  //     this.setupDataSubscription();
  //   } else {
  //     console.error('Cannot initialize map: lat or lng is not set');
  //   }
  // }

  // private setupDataSubscription() {
  //   this.subscription.add(
  //     combineLatest([
  //       this.latSubject,
  //       this.lngSubject,
  //       this.offersSubject,
  //       this.companiesSubject,
  //     ]).subscribe(([lat, lng, offers, companies]) => {
  //       console.log('Data updated', { lat, lng, offers, companies });
  //       if (this.mapInitialized) {
  //         this.updateMapCenter(lat, lng);
  //         this.updateMarkers(offers, companies);
  //       }
  //     }),
  //   );
  // }

  // private updateMapCenter(lat: number, lng: number) {
  //   if (this.map && lat && lng) {
  //     this.map.setView([lat, lng], this.map.getZoom());
  //     this.addCustomMarker();
  //   }
  // }

  // private updateMarkers(offers: OfferType[], companies: CompanyType[]) {
  //   if (!this.map) {
  //     console.error('Map is not initialized');
  //     return;
  //   }

  //   console.log('Updating markers', { offers, companies });

  //   // Clear existing markers
  //   if (this.markers) {
  //     this.markers.forEach((marker) => marker.remove());
  //   }
  //   this.markers = [];

  //   // Add markers for offers
  //   if (offers && Array.isArray(offers)) {
  //     console.log(`Processing ${offers.length} offers`);
  //     offers.forEach((offer, index) => {
  //       console.log(`Processing offer ${index}:`, offer);
  //       if (
  //         offer.address &&
  //         typeof offer.address.lat === 'number' &&
  //         typeof offer.address.lon === 'number'
  //       ) {
  //         const marker = this.createMarker(
  //           [offer.address.lat, offer.address.lon],
  //           'offer',
  //         );
  //         const popupContent = `
  //           <b>${offer.company?.name || 'Unknown Company'}</b><br>
  //           ${offer.company?.label || ''}<br>
  //           Product: ${offer.ontoFoodType?.label || 'Unknown'}<br>
  //           Amount: ${offer.product?.totalAmount || 'Unknown'} ${offer.product?.unit || ''}<br>
  //           From: ${offer.product?.dateStart || 'Unknown'}<br>
  //           To: ${offer.product?.dateEnd || 'Unknown'}
  //         `;
  //         marker.bindPopup(popupContent).addTo(this.map);
  //         this.markers.push(marker);
  //         console.log(`Added marker for offer ${index}`);
  //       } else {
  //         console.warn(
  //           `Offer ${index} has invalid or missing address data:`,
  //           offer.address,
  //         );
  //       }
  //     });
  //   } else {
  //     console.warn('Offers is not an array or is undefined', offers);
  //   }

  //   // Add markers for companies
  //   if (companies && Array.isArray(companies)) {
  //     console.log(`Processing ${companies.length} companies`);
  //     companies.forEach((company, index) => {
  //       console.log(`Processing company ${index}:`, company);
  //       const address = company.addresses?.[0];
  //       if (address) {
  //         const lat = this.getAddressCoordinate(address, 'lat');
  //         const lon = this.getAddressCoordinate(address, 'lon');
  //         if (lat !== null && lon !== null) {
  //           const companyType = this.getCompanyType(company);
  //           const marker = this.createMarker([lat, lon], companyType);
  //           const popupContent = `
  //             <b>${company.name || 'Unnamed Company'}</b><br>
  //             ${company.company?.label || ''}<br>
  //             Type: ${companyType}
  //           `;
  //           marker.bindPopup(popupContent).addTo(this.map);
  //           this.markers.push(marker);
  //           console.log(`Added marker for company ${index}`);
  //         } else {
  //           console.warn(`Company ${index} has invalid lat/lon:`, { lat, lon });
  //         }
  //       } else {
  //         console.warn(`Company ${index} has no address data:`, company);
  //       }
  //     });
  //   } else {
  //     console.warn('Companies is not an array or is undefined', companies);
  //   }

  //   this.centerMap();
  //   console.log(`Total markers added: ${this.markers.length}`);
  // }

  // private getAddressCoordinate(
  //   address: any,
  //   coord: 'lat' | 'lon',
  // ): number | null {
  //   if (typeof address === 'object' && address !== null) {
  //     const value = address[coord];
  //     if (typeof value === 'number') {
  //       return value;
  //     } else {
  //       console.warn(`Invalid ${coord} value:`, value);
  //       return null;
  //     }
  //   }
  //   console.warn('Invalid address object:', address);
  //   return null;
  // }

  // private getCompanyType(company: CompanyType): rbmRole {
  //   if (company.roles && Array.isArray(company.roles)) {
  //     return this.storeService.mapToRBMRole(company.roles);
  //   }
  //   console.warn('Company has no roles or roles is not an array:', company);
  //   return 'gastro'; // Default to gastro if roles are not available
  // }

  // private centerMap() {
  //   if (this.map && this.markers.length > 0) {
  //     const bounds = L.latLngBounds(
  //       this.markers.map((marker) => marker.getLatLng()),
  //     );
  //     this.map.fitBounds(bounds);
  //   }
  // }

  // private createMarker(
  //   latlng: [number, number],
  //   type: keyof typeof this.markerColors,
  // ): L.Marker {
  //   const icon = this.createDivIcon(this.markerColors[type].color);
  //   return L.marker(latlng, { icon });
  // }

  // private createDivIcon(color: string): L.DivIcon {
  //   return L.divIcon({
  //     className: 'custom-div-icon',
  //     html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
  //     iconSize: [10, 10],
  //     iconAnchor: [5, 5],
  //   });
  // }

  // private addCustomMarker() {
  //   if (this.map) {
  //     if (this.customMarker) {
  //       this.customMarker.remove();
  //     }
  //     const customIcon = this.createDivIcon(
  //       this.markerColors['myLocation'].color,
  //     );
  //     this.customMarker = L.marker([this.lat, this.lng], {
  //       icon: customIcon,
  //     }).addTo(this.map);
  //     this.customMarker
  //       .bindPopup(`<b>${this.markerColors['myLocation'].label}</b>`)
  //       .openPopup();
  //   }
  // }

  // private addLegend() {
  //   if (this.map) {
  //     const LegendControl = L.Control.extend({
  //       onAdd: (map: L.Map) => {
  //         const div = L.DomUtil.create('div', 'info legend');
  //         div.style.cssText =
  //           'background-color:white;padding:10px;border:1px solid #ccc;border-radius:5px;';

  //         let legendContent = ' ';
  //         Object.entries(this.markerColors).forEach(([key, value]) => {
  //           legendContent += `
  //             <div>
  //               <span style="background-color:${value.color};width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></span>
  //               ${value.label}
  //             </div>`;
  //         });

  //         div.innerHTML = legendContent;
  //         return div;
  //       },
  //     });

  //     new LegendControl({ position: 'bottomright' }).addTo(this.map);
  //   }
  // }
}
