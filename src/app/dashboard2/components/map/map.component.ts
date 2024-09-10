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
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() offers: OfferType[] = [];
  @Input() companies: CompanyType[] = [];

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private customMarker: L.Marker | null = null;
  private mapInitialized = false;

  private latSubject = new BehaviorSubject<number>(0);
  private lngSubject = new BehaviorSubject<number>(0);
  private offersSubject = new BehaviorSubject<OfferType[]>([]);
  private companiesSubject = new BehaviorSubject<CompanyType[]>([]);

  private subscription = new Subscription();

  private readonly markerColors: Record<
    string,
    { color: string; label: string }
  > = {
    refiner: { color: '#ff0000', label: 'Veredler' },
    producer: { color: '#00ff00', label: 'Erzeuger' },
    gastro: { color: '#0000ff', label: 'Gastronom' },
    offer: { color: '#000000', label: 'Angebot' },
    myLocation: { color: '#800080', label: 'Mein Standort' },
    default: { color: '#808080', label: 'Sonstige' },
  };

  constructor(private storeService: StoreService) {}

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateSubjects(changes);
    if (!this.mapInitialized) {
      this.initializeMap();
    } else {
      this.updateMap();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initializeMap() {
    if (!this.lat || !this.lng) {
      console.error('Cannot initialize map: lat or lng is not set');
      return;
    }

    this.map = L.map('map').setView([this.lat, this.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.mapInitialized = true;
    this.addCustomMarker();
    this.addLegend();
    this.setupDataSubscription();
  }

  private updateSubjects(changes: SimpleChanges) {
    if (changes['lat']) this.latSubject.next(this.lat);
    if (changes['lng']) this.lngSubject.next(this.lng);
    if (changes['offers']) this.offersSubject.next(this.offers || []);
    if (changes['companies']) this.companiesSubject.next(this.companies || []);
  }

  private setupDataSubscription() {
    this.subscription.add(
      combineLatest([
        this.latSubject,
        this.lngSubject,
        this.offersSubject,
        this.companiesSubject,
      ]).subscribe(([lat, lng, offers, companies]) => {
        this.updateMap();
      }),
    );
  }

  private updateMap() {
    if (!this.mapInitialized) return;
    this.updateMapCenter(this.lat, this.lng);
    this.updateMarkers(this.offers, this.companies);
  }

  private updateMapCenter(lat: number, lng: number) {
    if (this.map && lat && lng) {
      this.map.setView([lat, lng], this.map.getZoom());
      this.addCustomMarker();
    }
  }

  private updateMarkers(offers: OfferType[], companies: CompanyType[]) {
    if (!this.map) return;

    this.clearMarkers();
    this.addOfferMarkers(offers);
    this.addCompanyMarkers(companies);
    this.centerMap();
  }

  private clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  private addOfferMarkers(offers: OfferType[]) {
    offers.forEach((offer) => {
      const { lat, lon } = offer.address || {};
      if (typeof lat === 'number' && typeof lon === 'number') {
        const marker = this.createMarker([lat, lon], 'offer');
        marker.bindPopup(this.createOfferPopupContent(offer)).addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  private addCompanyMarkers(companies: CompanyType[]) {
    companies.forEach((company) => {
      const address = company.addresses?.[0];
      const lat = this.getAddressCoordinate(address, 'lat');
      const lon = this.getAddressCoordinate(address, 'lon');
      if (lat !== null && lon !== null) {
        const companyType = this.getCompanyType(company);
        const marker = this.createMarker([lat, lon], companyType);
        marker
          .bindPopup(this.createCompanyPopupContent(company))
          .addTo(this.map);
        this.markers.push(marker);
      }
    });
  }

  private getAddressCoordinate(
    address: any,
    coord: 'lat' | 'lon',
  ): number | null {
    return typeof address?.[coord] === 'number' ? address[coord] : null;
  }

  private getCompanyType(company: CompanyType): rbmRole {
    return company.roles && Array.isArray(company.roles)
      ? this.storeService.mapToRBMRole(company.roles)
      : 'gastro';
  }

  private centerMap() {
    if (this.map && this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map((marker) => marker.getLatLng()),
      );
      this.map.fitBounds(bounds);
    }
  }

  private createMarker(
    latlng: [number, number],
    type: keyof typeof this.markerColors,
  ): L.Marker {
    const icon = this.createDivIcon(this.markerColors[type].color);
    return L.marker(latlng, { icon });
  }

  private createDivIcon(color: string): L.DivIcon {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  }

  private addCustomMarker() {
    if (!this.map) return;

    if (this.customMarker) {
      this.customMarker.remove();
    }
    const customIcon = this.createDivIcon(
      this.markerColors['myLocation'].color,
    );
    this.customMarker = L.marker([this.lat, this.lng], {
      icon: customIcon,
    }).addTo(this.map);
    this.customMarker
      .bindPopup(`<b>${this.markerColors['myLocation'].label}</b>`)
      .openPopup();
  }

  private addLegend() {
    if (!this.map) return;

    const LegendControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.cssText =
          'background-color:white;padding:10px;border:1px solid #ccc;border-radius:5px;';
        div.innerHTML = this.createLegendContent();
        return div;
      },
    });

    new LegendControl({ position: 'bottomright' }).addTo(this.map);
  }

  private createLegendContent(): string {
    return Object.entries(this.markerColors)
      .map(
        ([key, value]) => `
      <div>
        <span style="background-color:${value.color};width:20px;height:20px;border-radius:50%;display:inline-block;margin-right:5px;"></span>
        ${value.label}
      </div>`,
      )
      .join('');
  }

  private createOfferPopupContent(offer: OfferType): string {
    return `
      <b>${offer.company?.name || 'Unknown Company'}</b><br>
      ${offer.company?.label || ''}<br>
      Product: ${offer.ontoFoodType?.label || 'Unknown'}<br>
      Amount: ${offer.product?.totalAmount || 'Unknown'} ${offer.product?.unit || ''}<br>
      From: ${offer.product?.dateStart || 'Unknown'}<br>
      To: ${offer.product?.dateEnd || 'Unknown'}
    `;
  }

  private createCompanyPopupContent(company: CompanyType): string {
    return `
      <b>${company.name || 'Unnamed Company'}</b><br>
      ${company.company?.label || ''}<br>
      Type: ${this.getCompanyType(company)}
    `;
  }
}
