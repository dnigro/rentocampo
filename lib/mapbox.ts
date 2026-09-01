export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const MAP_DEFAULTS = {
  center: [-63.5, -34.0] as [number, number],
  zoom: 4.5,
  style: 'mapbox://styles/mapbox/outdoors-v12',
}
