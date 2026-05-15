import { TransportRequest, Transporter, SharedDeliveryGroup } from '../types';

/**
 * Estimates transport cost based on distance and load
 */
export function estimateTransportCost(quantity: number, unit: string, distanceKm: number = 20) {
  // Simple heuristic for demo
  const baseRate = 85; // KSh per bag per specific distance
  const quantityFactor = unit.toLowerCase().includes('bag') ? quantity : (quantity / 50); // Normalized to 50kg bags
  return Math.round(quantityFactor * baseRate * (distanceKm / 10));
}

/**
 * Calculates potential savings if joining a group
 */
export function calculatePotentialSavings(request: Partial<TransportRequest>, group: SharedDeliveryGroup) {
  // Groups typically save 30-45%
  const individualCost = estimateTransportCost(request.quantity || 0, request.unit || 'Bag');
  return Math.round(individualCost * 0.38);
}

/**
 * Ranks transporters based on proximity, capacity, and rating
 */
export function rankTransporters(request: Partial<TransportRequest>, transporters: Transporter[]) {
  return transporters
    .filter(t => t.available)
    .map(t => {
      let score = (t.rating || 0) * 10;
      
      // Bonus if in same location
      if (t.currentLocation.toLowerCase() === request.pickupLocation?.toLowerCase()) {
        score += 50;
      }

      // Bonus if vehicle matches urgency / load
      if (request.urgency === 'high' && t.vehicleType === 'Pickup') {
        score += 20; // Fast for small urgency
      }

      return { ...t, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Recommends the best vehicle type for a given quantity
 */
export function recommendVehicle(quantity: number, unit: string) {
  const normQuantity = unit.toLowerCase().includes('bag') ? quantity : (quantity / 50);
  
  if (normQuantity <= 20) return { type: 'Pickup', reason: 'Agile and cost-effective for small loads' };
  if (normQuantity <= 100) return { type: 'Truck (Canter)', reason: 'Perfect for medium-scale harvests' };
  return { type: 'Lorry (Full size)', reason: 'Maximizes ROI on bulk transport' };
}
