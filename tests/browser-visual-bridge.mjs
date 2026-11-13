// Optional transport bridge for this managed environment's Chromium CA limitation.
// curl retains TLS verification. This does not modify the application or image files.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run=promisify(execFile);
export async function installVisualBridge(context) {
 const cache=new Map();
 const fetchImage=url=>{
  if(!cache.has(url)) cache.set(url,run('curl',['-fsS','--max-time','20','--proxy',process.env.HTTPS_PROXY||'', '-A','RentoCampo-Preview-QA/3.0 (+https://rentocampo.com)', '-e','https://rentocampo.com/',url],{encoding:'buffer',maxBuffer:12*1024*1024}));
  return cache.get(url);
 };
 async function fulfill(route,url) {
  try {
   const {stdout}=await fetchImage(url);
   const type=stdout.subarray(1,4).toString()==='PNG'?'image/png':stdout.subarray(8,12).toString()==='WEBP'?'image/webp':'image/jpeg';
   await route.fulfill({contentType:type,body:stdout});
  } catch {await route.abort();}
 }
 await context.route('https://*.tile.openstreetmap.org/**',route=>{const url=new URL(route.request().url());url.hostname='tile.openstreetmap.org';return fulfill(route,url.href);});
 await context.route('**/_next/image?*',route=>{
  const src=new URL(route.request().url()).searchParams.get('url');
  try {
   const url=new URL(src);
   if(url.protocol==='https:' && url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/')) return fulfill(route,url.href);
  } catch { /* local assets use the regular optimizer */ }
  return route.continue();
 });
}
