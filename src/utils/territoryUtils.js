// Territory calculation and management utilities

/**
 * Calculate the area of a polygon using the Shoelace formula
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {number} - Area in square kilometers
 */
export const calculatePolygonArea = (coordinates) => {
  if (coordinates.length < 3) return 0;
  
  // Convert to radians for more accurate calculation
  const toRadians = (degrees) => degrees * Math.PI / 180;
  
  let area = 0;
  const n = coordinates.length;
  
  // Shoelace formula
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRadians(coordinates[i][0]);
    const lat2 = toRadians(coordinates[j][0]);
    const lng1 = toRadians(coordinates[i][1]);
    const lng2 = toRadians(coordinates[j][1]);
    
    area += lng1 * lat2 - lng2 * lat1;
  }
  
  area = Math.abs(area) / 2;
  
  // Convert from degrees^2 to km^2 (approximate)
  const earthRadius = 6371; // km
  return area * earthRadius * earthRadius;
};

/**
 * Create a territory from a GPS path
 * @param {Array} path - Array of [lat, lng] coordinates
 * @param {Object} owner - Owner information
 * @returns {Object} - Territory object
 */
export const createTerritoryFromPath = (path, owner) => {
  if (path.length < 3) {
    throw new Error('At least 3 GPS points required to create a territory');
  }
  
  // Simplify the path to create a polygon (take every nth point)
  const step = Math.max(1, Math.floor(path.length / 20)); // Max 20 points for polygon
  const simplifiedPath = path.filter((_, index) => index % step === 0);
  
  // Ensure polygon is closed
  if (simplifiedPath[0][0] !== simplifiedPath[simplifiedPath.length - 1][0] ||
      simplifiedPath[0][1] !== simplifiedPath[simplifiedPath.length - 1][1]) {
    simplifiedPath.push(simplifiedPath[0]);
  }
  
  const area = calculatePolygonArea(simplifiedPath);
  const center = getPolygonCenter(simplifiedPath);
  
  return {
    id: Date.now().toString(),
    name: generateTerritoryName(center),
    owner: owner.id || 'user',
    coordinates: simplifiedPath,
    area: area,
    center: center,
    capturedAt: new Date().toISOString(),
    pathLength: path.length
  };
};

/**
 * Get the center point of a polygon
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {Array} - [lat, lng] center point
 */
export const getPolygonCenter = (coordinates) => {
  if (coordinates.length === 0) return [0, 0];
  
  const sumLat = coordinates.reduce((sum, point) => sum + point[0], 0);
  const sumLng = coordinates.reduce((sum, point) => sum + point[1], 0);
  
  return [
    sumLat / coordinates.length,
    sumLng / coordinates.length
  ];
};

/**
 * Generate a territory name based on location
 * @param {Array} center - [lat, lng] center point
 * @returns {string} - Territory name
 */
export const generateTerritoryName = (center) => {
  const names = [
    'Central Plaza', 'Riverside Run', 'Hilltop Haven', 'City Center',
    'Park Path', 'Downtown District', 'Urban Oasis', 'Green Zone',
    'Athletic Arena', 'Fitness Field', 'Runner\'s Ridge', 'Trail Territory'
  ];
  
  const randomIndex = Math.abs(Math.floor(center[0] + center[1])) % names.length;
  return names[randomIndex];
};

/**
 * Check if two polygons overlap
 * @param {Array} poly1 - First polygon coordinates
 * @param {Array} poly2 - Second polygon coordinates
 * @returns {boolean} - True if polygons overlap
 */
export const checkPolygonOverlap = (poly1, poly2) => {
  // Simple bounding box check for performance
  const bounds1 = getPolygonBounds(poly1);
  const bounds2 = getPolygonBounds(poly2);
  
  return !(bounds1.maxLat < bounds2.minLat || 
           bounds2.maxLat < bounds1.minLat || 
           bounds1.maxLng < bounds2.minLng || 
           bounds2.maxLng < bounds1.minLng);
};

/**
 * Get bounding box of a polygon
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {Object} - Bounding box {minLat, maxLat, minLng, maxLng}
 */
export const getPolygonBounds = (coordinates) => {
  const lats = coordinates.map(point => point[0]);
  const lngs = coordinates.map(point => point[1]);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
};

/**
 * Check if a territory can be captured based on rules
 * @param {Object} territory - Territory to check
 * @param {Array} existingTerritories - Existing territories
 * @param {Object} user - User information
 * @returns {Object} - {canCapture: boolean, reason: string}
 */
export const canCaptureTerritory = (territory, existingTerritories, user) => {
  // Minimum area requirement
  if (territory.area < 0.01) { // 0.01 km² minimum
    return { canCapture: false, reason: 'Territory too small (minimum 0.01 km²)' };
  }
  
  // Check for overlaps with user's existing territories
  const userTerritories = existingTerritories.filter(t => t.owner === user.id || t.owner === 'user');
  for (const userTerritory of userTerritories) {
    if (checkPolygonOverlap(territory.coordinates, userTerritory.coordinates)) {
      return { canCapture: false, reason: 'Overlaps with your existing territory' };
    }
  }
  
  // Check for overlaps with other users' territories (optional rule)
  const otherTerritories = existingTerritories.filter(t => t.owner !== user.id && t.owner !== 'user');
  for (const otherTerritory of otherTerritories) {
    if (checkPolygonOverlap(territory.coordinates, otherTerritory.coordinates)) {
      return { canCapture: false, reason: 'Overlaps with existing territory' };
    }
  }
  
  return { canCapture: true, reason: 'Territory can be captured' };
};

/**
 * Calculate points earned for a territory
 * @param {Object} territory - Territory object
 * @returns {number} - Points earned
 */
export const calculateTerritoryPoints = (territory) => {
  const basePoints = 100;
  const areaPoints = Math.floor(territory.area * 1000); // 1 point per 0.001 km²
  const pathPoints = Math.min(territory.pathLength, 100); // Max 100 points for path length
  
  return basePoints + areaPoints + pathPoints;
};
