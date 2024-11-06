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
import { NearbuyRole } from '../../../shared/store/store.service';

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
    rbmRole | 'myLocation',
    { color: string; label: string }
  > = {
    refiner: { color: '#ff0000', label: 'Veredler' }, // Red
    producer: { color: '#00ff00', label: 'Erzeuger' }, // Green
    supplier: { color: '#FF8C00', label: 'Lieferant' }, // Dark orange
    gastro: { color: '#0000ff', label: 'Gastronom' }, // Blue
    myLocation: { color: '#800080', label: 'Mein Standort' }, // Purple
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
    this.addCenterControl(); // Add center control
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
    this.updateMarkers(this.offers); // Remove companies parameter
  }

  private clearMarkers() {
    // Remove each marker from the map
    this.markers.forEach((marker) => {
      marker.remove();
    });
    // Clear the markers array
    this.markers = [];
  }

  private updateMapCenter(lat: number, lng: number) {
    if (this.map && lat && lng) {
      this.map.setView([lat, lng], this.map.getZoom());
      this.addCustomMarker();
    }
  }

  private updateMarkers(offers: OfferType[]) {
    if (!this.map) return;

    this.clearMarkers();
    const offersByCompany = new Map<string, OfferType[]>();

    // Group offers by company
    offers.forEach((offer) => {
      if (offer.company?.id) {
        const companyId = offer.company.id;
        if (!offersByCompany.has(companyId)) {
          offersByCompany.set(companyId, []);
        }
        offersByCompany.get(companyId)?.push(offer);
      }
    });

    offersByCompany.forEach((companyOffers, companyId) => {
      if (companyOffers.length > 0) {
        const firstOffer = companyOffers[0];
        const { lat, lon } = firstOffer.address || {};

        if (typeof lat === 'number' && typeof lon === 'number') {
          // Find the full company data from our companies input
          const fullCompanyData = this.companies.find(
            (c) => c.id === companyId,
          );

          // Get roles from the offer itself, falling back to a default role
          const role = this.determineCompanyRole(
            firstOffer.roles || [],
            fullCompanyData?.roles,
          );

          const markerColor =
            this.markerColors[role]?.color || this.markerColors['gastro'].color;

          const marker = this.createMarker([lat, lon], markerColor);
          marker
            .bindPopup(this.createCompanyOffersPopup(companyOffers))
            .addTo(this.map);
          this.markers.push(marker);
        }
      }
    });

    this.centerMap();
  }

  private determineCompanyRole(
    offerRoles: string[],
    companyRoles?: string[],
  ): rbmRole {
    if (
      companyRoles &&
      Array.isArray(companyRoles) &&
      companyRoles.length > 0
    ) {
      return this.storeService.mapToRBMRole(companyRoles);
    }

    if (Array.isArray(offerRoles) && offerRoles.length > 0) {
      return this.storeService.mapToRBMRole(offerRoles);
    }

    console.warn('No valid roles found, using default role');
    return 'gastro';
  }

  private createCompanyOffersPopup(offers: OfferType[]): string {
    if (!offers.length) return '';

    const firstOffer = offers[0];
    if (!firstOffer.company) return '';

    // Group offers by category
    const offersByCategory = new Map<string, OfferType[]>();

    offers.forEach((offer) => {
      const categoryLabel =
        offer.ontoFoodType?.label ||
        this.getProductCategory(offer.links.category);
      if (!offersByCategory.has(categoryLabel)) {
        offersByCategory.set(categoryLabel, []);
      }
      offersByCategory.get(categoryLabel)?.push(offer);
    });

    // Create HTML for offers grouped by category with collapsible sections
    const offersHtml = Array.from(offersByCategory.entries())
      .map(
        ([category, categoryOffers], index) => `
        <div class="category-section" style="margin-bottom: 8px;">
          <div 
            onclick="document.getElementById('category-${index}').style.display = document.getElementById('category-${index}').style.display === 'none' ? 'block' : 'none';"
            style="
              cursor: pointer;
              padding: 4px 8px;
              background-color: #f5f5f5;
              border-radius: 4px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="color: #2196F3; font-weight: bold;">
              ${category} (${categoryOffers.length})
            </span>
            <span style="color: #666; font-size: 12px;">▼</span>
          </div>
          <div id="category-${index}" style="
            display: ${index === 0 ? 'block' : 'none'};
            padding: 8px;
            margin-top: 4px;
            border-left: 2px solid #e0e0e0;
          ">
            ${categoryOffers
              .map(
                (offer) => `
              <div style="margin-bottom: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #333; font-weight: 500;">
                    ${offer.product.totalAmount} ${offer.product.unit}
                  </span>
                  <span style="color: #666; font-size: 12px;">
                    ${
                      !offer.product.dateEnd
                        ? '(Dauerhaft)'
                        : this.formatDateRange(
                            offer.product.dateStart,
                            offer.product.dateEnd,
                          )
                    }
                  </span>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      `,
      )
      .join('');

    // Create the popup content
    return `
      <div style="max-width: 300px; min-width: 250px;">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            ${firstOffer.company.name}
            ${
              firstOffer.company.verified
                ? '<span style="color: #4CAF50; font-size: 0.8em;">✓</span>'
                : ''
            }
          </div>
          <div style="color: #666; font-size: 13px;">
            ${firstOffer.company.label || ''}
          </div>
        </div>
  
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px;">
            <strong>Standort:</strong> ${firstOffer.address?.city || 'k.A.'}
          </div>
          ${
            firstOffer.roles?.length
              ? `
            <div style="font-size: 13px;">
              <strong>Rollen:</strong> ${this.formatRoles(firstOffer.roles)}
            </div>
          `
              : ''
          }
        </div>
  
        <div style="border-top: 1px solid #eee; padding-top: 8px;">
          <div style="font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>Verfügbare Produkte</span>
            <span style="color: #666; font-size: 13px;">${offers.length} total</span>
          </div>
          ${offersHtml}
        </div>
      </div>
    `;
  }

  private getProductCategory(categoryUrl: string): string {
    try {
      const parts = categoryUrl.split('/');
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.replace('OF#PRODUCT#', ''))
        .replace(/_/g, ' ')
        .replace(/\+/g, ' ');
    } catch (error) {
      return 'Unbekannte Kategorie';
    }
  }

  private formatRoles(roles: string[]): string {
    const roleMap: Record<string, string> = {
      SUPPLIER: 'Lieferant',
      PROCESSOR: 'Verarbeiter',
      CONSOLIDATOR: 'Konsolidierer',
      SHIPPER: 'Versender',
      CUSTOMER: 'Kunde',
      PRODUCER: 'Produzent',
      GASTRO: 'Gastronom',
    };

    return roles
      .filter((role): role is NearbuyRole => role in roleMap) // Type guard to ensure valid roles
      .map((role) => roleMap[role])
      .join(', ');
  }

  private formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // If dates are in the same month
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${startDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`;
    }

    return `${startDate.toLocaleDateString('de-DE', { month: 'short' })} - ${endDate.toLocaleDateString(
      'de-DE',
      { month: 'short', year: 'numeric' },
    )}`;
  }

  private centerMap() {
    if (this.map && this.markers.length > 0) {
      // Create a bounds object that includes all markers
      const bounds = L.latLngBounds(
        this.markers.map((marker) => marker.getLatLng()),
      );
      // Fit the map to show all markers
      this.map.fitBounds(bounds, {
        padding: [50, 50], // Add some padding around the bounds
      });
    }
  }

  private createMarker(latlng: [number, number], color: string): L.Marker {
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color}; 
          width: 15px; 
          height: 15px; 
          border-radius: 50%; 
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        "></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7],
    });

    return L.marker(latlng, { icon });
  }

  private addCustomMarker() {
    if (!this.map) return;

    if (this.customMarker) {
      this.customMarker.remove();
    }

    const customIcon = this.createMarker(
      [this.lat, this.lng],
      this.markerColors['myLocation'].color,
    );

    this.customMarker = customIcon.addTo(this.map);
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
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="
            background-color: ${value.color};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
            border: 1px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
          "></span>
          ${value.label}
        </div>`,
      )
      .join('');
  }

  private addCenterControl() {
    const centerControl = L.Control.extend({
      options: {
        position: 'topleft',
      },

      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control',
        );
        const button = L.DomUtil.create('a', '', container);

        // Style the button with inline styles
        button.innerHTML =
          '<i class="pi pi-compass" style="font-size: 1.2rem;"></i>';
        button.title = 'Zu meinem Standort';
        button.href = '#';
        button.style.width = '34px';
        button.style.height = '34px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = 'white';
        button.style.color = '#666';

        // Add hover effect
        button.onmouseover = () => {
          button.style.backgroundColor = '#f4f4f4';
        };
        button.onmouseout = () => {
          button.style.backgroundColor = 'white';
        };

        // Add click event
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          this.centerToMyLocation();
        });

        return container;
      },
    });

    new centerControl().addTo(this.map);
  }

  private centerToMyLocation() {
    if (this.lat && this.lng) {
      this.map.setView([this.lat, this.lng], 13, {
        animate: true,
        duration: 1, // 1 second animation
      });

      if (this.customMarker) {
        const markerElement = this.customMarker.getElement();
        if (markerElement) {
          // Pulse animation using inline styles
          markerElement.style.transition = 'transform 0.3s ease';
          markerElement.style.transform = 'scale(1.2)';
          setTimeout(() => {
            if (markerElement) {
              markerElement.style.transform = 'scale(1)';
            }
          }, 300);
        }
      }
    }
  }
}
