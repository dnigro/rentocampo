import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationPhotos } from '../lib/publication-photos.ts';
test('service gallery preserves the main photo, deduplicates and supports legacy missing galleries',()=>{
 assert.deepEqual(publicationPhotos('/main.jpg',['/main.jpg','/second.jpg',null,42]),['/main.jpg','/second.jpg']);
 assert.deepEqual(publicationPhotos('/main.jpg',undefined),['/main.jpg']);
 assert.deepEqual(publicationPhotos(null,null),[]);
 assert.equal(publicationPhotos(null,Array.from({length:12},(_,index)=>`/${index}.jpg`)).length,8);
});
