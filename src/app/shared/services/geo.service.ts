import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  private readonly EARTH_RADIUS_KM = 6371; // Radius of the Earth in kilometers

  constructor() {}

  /**
   * Calculates the bounding box for a given distance from a starting latitude and longitude.
   * @param distance The distance in kilometers.
   * @param lat The starting latitude.
   * @param lon The starting longitude.
   * @returns An object containing the min and max latitudes and longitudes.
   */
  getBoundingBox(distance: number, lat: number, lon: number) {
    const deltaLat = distance / this.EARTH_RADIUS_KM;
    const deltaLon =
      distance / (this.EARTH_RADIUS_KM * Math.cos(this.degToRad(lat)));

    const latMin = lat - this.radToDeg(deltaLat);
    const latMax = lat + this.radToDeg(deltaLat);
    const lonMin = lon - this.radToDeg(deltaLon);
    const lonMax = lon + this.radToDeg(deltaLon);

    return {
      latMin,
      latMax,
      lonMin,
      lonMax,
    };
  }

  /**
   * Converts degrees to radians.
   * @param degrees The degrees to convert.
   * @returns The radians.
   */
  private degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts radians to degrees.
   * @param radians The radians to convert.
   * @returns The degrees.
   */
  private radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }
}
