/**
 * Phase 4.3: Smart Routing & Dispatch Algorithm
 * 
 * This module implements an advanced driver matchmaking algorithm that goes
 * beyond simple proximity matching. It considers:
 * 
 * 1. Proximity Score (40%): Haversine distance between driver and pickup
 * 2. Trajectory Alignment (30%): How well driver's current direction aligns with route
 * 3. Driver Quality (20%): Rating, completion rate, cancellation rate
 * 4. Demand Balance (10%): Zone demand vs driver supply
 * 
 * Usage:
 *   const rankedDrivers = calculateDriverScores(drivers, pickup, drop, demandZones);
 *   const bestDriver = rankedDrivers[0];
 */

interface Location {
  lat: number;
  lng: number;
}

interface Driver {
  id: string;
  location: Location;
  currentBearing?: number;     // degrees 0-360
  rating: number;              // 0-5
  totalRides: number;
  cancellationRate: number;    // 0-1
  isOnline: boolean;
  vehicleType: string;
  currentVehicleType?: string;
}

interface DemandZone {
  center: Location;
  radiusKm: number;
  demandScore: number;         // 0-1
}

function haversineDistance(a: Location, b: Location): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c = 2 * Math.atan2(
    Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng),
    Math.sqrt(1 - (sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng))
  );
  return R * c;
}

function bearing(a: Location, b: Location): number {
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function bearingDifference(b1: number, b2: number): number {
  const diff = Math.abs(b1 - b2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function proximityScore(driver: Driver, pickup: Location): number {
  const distance = haversineDistance(driver.location, pickup);
  // Exponential decay: score = e^(-distance/3km)
  const score = Math.exp(-distance / 3);
  return Math.min(1, Math.max(0, score));
}

function trajectoryScore(driver: Driver, pickup: Location, drop: Location): number {
  if (driver.currentBearing === undefined) return 0.5;
  const routeBearing = bearing(pickup, drop);
  const driverToPickupBearing = bearing(driver.location, pickup);
  
  // How aligned is driver heading with route direction
  const alignment = bearingDifference(driver.currentBearing, routeBearing);
  // How aligned is driver heading toward pickup
  const towardPickup = bearingDifference(driver.currentBearing, driverToPickupBearing);
  
  const routeAlignmentScore = 1 - alignment / 180;
  const pickupApproachScore = 1 - towardPickup / 180;
  
  return (routeAlignmentScore * 0.6 + pickupApproachScore * 0.4);
}

function qualityScore(driver: Driver): number {
  const ratingScore = driver.rating / 5;
  const experienceScore = Math.min(driver.totalRides / 100, 1);
  const reliabilityScore = 1 - driver.cancellationRate;
  return (ratingScore * 0.5 + experienceScore * 0.2 + reliabilityScore * 0.3);
}

function demandBalanceScore(driver: Driver, demandZones: DemandZone[]): number {
  let zoneScore = 0.5;
  for (const zone of demandZones) {
    const dist = haversineDistance(driver.location, zone.center);
    if (dist <= zone.radiusKm) {
      zoneScore = 0.5 + (zone.demandScore - 0.5) * 0.5;
      break;
    }
  }
  return zoneScore;
}

export interface DriverScore {
  driver: Driver;
  totalScore: number;
  breakdown: {
    proximity: number;
    trajectory: number;
    quality: number;
    demandBalance: number;
  };
  estimatedEtaMinutes: number;
}

export function calculateDriverScores(
  drivers: Driver[],
  pickup: Location,
  drop: Location,
  demandZones: DemandZone[] = []
): DriverScore[] {
  const scored: DriverScore[] = drivers
    .filter((d) => d.isOnline)
    .map((driver) => {
      const proximity = proximityScore(driver, pickup);
      const trajectory = trajectoryScore(driver, pickup, drop);
      const quality = qualityScore(driver);
      const demandBalance = demandBalanceScore(driver, demandZones);

      const totalScore =
        proximity * 0.40 +
        trajectory * 0.30 +
        quality * 0.20 +
        demandBalance * 0.10;

      const distance = haversineDistance(driver.location, pickup);
      const estimatedEtaMinutes = Math.round(distance / 0.4); // ~24km/h average speed in city

      return {
        driver,
        totalScore,
        breakdown: { proximity, trajectory, quality, demandBalance },
        estimatedEtaMinutes,
      };
    });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}

/**
 * Predictive surge pricing based on demand-supply ratio
 */
export function calculateSurgeMultiplier(
  activeRequests: number,
  availableDrivers: number,
  weatherSeverity: number = 0,     // 0-1 (rain, fog, etc.)
  eventBoost: number = 0           // 0-1 (stadium, concert nearby)
): number {
  const baseRatio = availableDrivers > 0 ? activeRequests / availableDrivers : 10;
  const weatherFactor = 1 + weatherSeverity * 0.5;
  const eventFactor = 1 + eventBoost * 0.3;

  const effectiveDemand = baseRatio * weatherFactor * eventFactor;

  if (effectiveDemand < 1.0) return 1.0;
  if (effectiveDemand < 1.5) return 1.2;
  if (effectiveDemand < 2.5) return 1.5;
  if (effectiveDemand < 4.0) return 2.0;
  return Math.min(3.0, 2.0 + (effectiveDemand - 4.0) * 0.2);
}

