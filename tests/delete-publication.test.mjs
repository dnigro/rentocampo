import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deleteOwnedPublication } from "../lib/delete-owned-publication.ts";

const id = "12345678-1234-1234-1234-123456789abc";
function client({ user = {id:"owner"}, rows = {id}, error = null, throws = false } = {}) {
  const filters = [], tables = [];
  const query = { eq: (key,value) => {filters.push([key,value]);return query;}, select: () => query,
    maybeSingle: async () => {if(throws) throw Error("offline"); return {data:rows,error};} };
  return { filters, tables, auth: {getUser:async()=>({data:{user}})}, from:table=>{tables.push(table);return {delete:()=>query};} };
}
for (const table of ["campos", "servicios_publicaciones"]) {
  test(`${table}: success requires a returned row and limits deletion to owner`, async()=>{
    const db=client();const response=await deleteOwnedPublication(db,table,id);
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true,id});
    assert.deepEqual(db.filters,[["id",id],["propietario_id","owner"]]);assert.deepEqual(db.tables,[table]);
  });
  test(`${table}: anonymous callers never reach deletion`,async()=>{
    const db=client({user:null});assert.equal((await deleteOwnedPublication(db,table,id)).status,401);assert.equal(db.tables.length,0);
  });
  test(`${table}: zero rows (RLS denial, missing or already deleted) is not success`,async()=>{
    const response=await deleteOwnedPublication(client({rows:null}),table,id);assert.equal(response.status,404);assert.equal((await response.json()).ok,undefined);
  });
  test(`${table}: foreign key conflict leaves a recoverable error`,async()=>{
    assert.equal((await deleteOwnedPublication(client({rows:null,error:{code:"23503"}}),table,id)).status,409);
  });
  test(`${table}: connection failure returns an error, retry can succeed`,async()=>{
    assert.equal((await deleteOwnedPublication(client({throws:true}),table,id)).status,500);
    assert.equal((await deleteOwnedPublication(client(),table,id)).status,200);
  });
}
test("invalid ID never calls the database",async()=>{const db=client();assert.equal((await deleteOwnedPublication(db,"campos","not-an-id")).status,400);assert.equal(db.tables.length,0);});

test("account deletion uses only authenticated server-side Admin Auth, not exposed RPC", () => {
  const route = readFileSync(new URL("../app/api/account/route.ts", import.meta.url), "utf8");
  assert.match(route, /supabase\\.auth\\.getUser\\(\\)/);
  assert.match(route, /body\\?\\.confirmation !== "ELIMINAR"/);
  assert.match(route, /admin\\.auth\\.admin\\.deleteUser\\(user\\.id\\)/);
  assert.doesNotMatch(route, /\\.rpc\\("delete_own_account"/);
});
