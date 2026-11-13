import test from 'node:test';
import assert from 'node:assert/strict';
import {filterRuralListings} from '../lib/v3/filter-listings.ts';

const filters={location:'',operation:'',aptitude:'',service:''};
const listings=[
 {id:'field',kind:'campo',localidad:'São José',provincia:'São Paulo',coverage:null,operacion:'ambas',aptitud:'agricola',services:[]},
 {id:'service',kind:'servicio',localidad:'Rafaela',provincia:'Santa Fe',coverage:'São José y alrededores',operacion:null,aptitud:null,services:['veterinaria']},
];

test('combined exploration applies accent-insensitive location to fields and provider coverage',()=>{
 assert.deepEqual(filterRuralListings(listings,'todo',{...filters,location:' SAO JOSE '}).map(x=>x.id),['field','service']);
});
test('combined exploration ignores retained specialty and operation filters',()=>{
 assert.equal(filterRuralListings(listings,'todo',{...filters,operation:'venta',aptitude:'forestal',service:'cosecha'}).length,2);
});
test('field exploration includes dual-operation listings and respects aptitude',()=>{
 assert.deepEqual(filterRuralListings(listings,'campo',{...filters,operation:'venta',aptitude:'agricola'}).map(x=>x.id),['field']);
 assert.equal(filterRuralListings(listings,'campo',{...filters,aptitude:'forestal'}).length,0);
});
test('service exploration respects specialty without mutating source listings',()=>{
 const before=structuredClone(listings);
 assert.deepEqual(filterRuralListings(listings,'servicio',{...filters,service:'veterinaria'}).map(x=>x.id),['service']);
 assert.equal(filterRuralListings(listings,'servicio',{...filters,service:'riego'}).length,0);
 assert.deepEqual(listings,before);
});
