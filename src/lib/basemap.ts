import type { StyleSpecification } from 'maplibre-gl';

/**
 * The basemap, in one place so the globe and the route maps stay identical.
 *
 * Esri's Dark Gray Canvas: a genuinely dark basemap that needs no API key, with
 * the place labels on a separate reference layer. CARTO's tiles started coming
 * back stamped "API KEY REQUIRED", which is what this replaces.
 */
const ESRI = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas';
const ATTRIBUTION = '© Esri, HERE, Garmin, © OpenStreetMap contributors';

export const baseStyle: StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: 'raster',
      tiles: [`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 16,
      attribution: ATTRIBUTION,
    },
    labels: {
      type: 'raster',
      tiles: [`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      maxzoom: 16,
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#100e0c' } },
    { id: 'base', type: 'raster', source: 'base' },
    { id: 'labels', type: 'raster', source: 'labels', paint: { 'raster-opacity': 0.85 } },
  ],
};
