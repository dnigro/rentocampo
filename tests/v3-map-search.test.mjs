import test from 'node:test';
import assert from 'node:assert/strict';
import { isWithinBounds, markerLabel } from '../lib/campos/map-search.ts';
const bounds = { north: -30, south: -40, west: -65, east: -55 };
test('map search includes boundary locations and excludes unknown or invalid coordinates', () => {
  assert.equal(isWithinBounds({lat:-35,lng:-60},bounds),true);
  assert.equal(isWithinBounds({lat:-30,lng:-55},bounds),true);
  for(const point of [{lat:null,lng:-60},{lat:-35,lng:null},{lat:NaN,lng:-60},{lat:91,lng:-60},{lat:-35,lng:200},{lat:-41,lng:-60}]) {
    assert.equal(isWithinBounds(point,bounds),false);
  }
});
test('map search supports antimeridian and wrapped Leaflet worlds', () => {
  for(const b of [{north:20,south:-20,west:170,east:-170},{north:20,south:-20,west:170,east:190}]) {
    assert.equal(isWithinBounds({lat:0,lng:175},b),true);
    assert.equal(isWithinBounds({lat:0,lng:-175},b),true);
    assert.equal(isWithinBounds({lat:0,lng:0},b),false);
  }
  assert.equal(isWithinBounds({lat:0,lng:-150},{north:90,south:-90,west:-200,east:200}),true);
});
test('markers only show real price and currency, falling back to known surface area', () => {
  assert.equal(markerLabel({precio:1200,moneda:'USD',hectareas:100},'es-AR'),'USD 1.200');
  assert.equal(markerLabel({precio:1200,moneda:null,hectareas:100},'es-AR'),'100 ha');
  assert.equal(markerLabel({precio:null,moneda:null,hectareas:null},'es-AR'),'Ver campo');
  assert.equal(markerLabel({precio:NaN,moneda:'USD',hectareas:NaN},'es-AR'),'Ver campo');
});

test('map bounds round-trip through detail links and reject malformed query strings', async () => {
  const { parseMapBounds, addMapBounds } = await import('../lib/campos/map-search.ts');
  const search = addMapBounds(new URLSearchParams('pais=AR'), bounds);
  assert.deepEqual(parseMapBounds(Object.fromEntries(search)), bounds);
  for (const params of [{}, {north:'',south:'-40',east:'-55',west:'-65'},
    {north:'-50',south:'-40',east:'-55',west:'-65'},
    {north:'90',south:'-91',east:'-55',west:'-65'},
    {north:'0',south:'-40',east:'Infinity',west:'-65'}]) assert.equal(parseMapBounds(params),null);
});

// Listings without a precise point remain discoverable without a fabricated marker.
test('map result list retains missing locations while respecting bounds for located listings', async () => {
  const { hasMapLocation, matchesMapArea } = await import('../lib/campos/map-search.ts');
  const area = {north:-30,south:-35,west:-65,east:-55};
  assert.equal(matchesMapArea({lat:null,lng:null},area),true);
  assert.equal(matchesMapArea({lat:-32,lng:null},area),true);
  assert.equal(matchesMapArea({lat:-32,lng:-60},area),true);
  assert.equal(matchesMapArea({lat:-20,lng:-60},area),false);
  assert.equal(hasMapLocation({lat:null,lng:null}),false);
  assert.equal(hasMapLocation({lat:-32,lng:-60}),true);
});
