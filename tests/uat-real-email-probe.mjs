import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.UAT_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.UAT_SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.UAT_PROBE_EMAIL?.trim().toLowerCase();
if (url !== "https://wibqszhvuvpjycheaxzi.supabase.co" ||
    !publishable || !secret || !email?.endsWith("@yopmail.com")) {
  throw Error("UAT guard rejected credentials, project or disposable test address");
}
const admin = createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const client = createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
const before = await admin.auth.admin.listUsers({page:1,perPage:1000});
if (before.error) throw Error("Cannot inspect UAT users: "+before.error.message);
if (before.data.users.some(u=>u.email?.toLowerCase()===email)) {
 console.error("BLOCKED: Account already exists in UAT. No signup attempted.");
 process.exitCode=2;
} else {
 const password=randomBytes(36).toString("base64url")+"Aa1!";
 const { data, error }=await client.auth.signUp({
  email,password,
  options:{
   // Test only: never redirect a UAT confirmation into production.
   emailRedirectTo:"http://127.0.0.1:3000/auth/callback",
   data:{nombre:"UAT Yopmail Email Probe",tipo:"propietario",country_code:"AR",terms_accepted_at:new Date().toISOString(),terms_version:"2026-09-23"},
  },
 });
 if(error){
   console.error("SIGNUP_REJECTED code="+String(error.code ?? "unknown")+" status="+String(error.status ?? "unknown")+
     " message="+error.message.replaceAll(email,"<test-address>"));
   console.log("No claim of email delivery. The address will remain unused if Auth rejected it.");
   process.exitCode=3;
 }else{
  console.log("SIGNUP_ACCEPTED user_created="+Boolean(data.user?.id)+" has_session="+Boolean(data.session));
  const after=await admin.auth.admin.listUsers({page:1,perPage:1000});
  if(after.error)throw Error("Cannot inspect new UAT account: "+after.error.message);
  const user=after.data.users.find(u=>u.email?.toLowerCase()===email);
  console.log("UAT_ACCOUNT_FOUND="+Boolean(user)+" EMAIL_CONFIRMED="+Boolean(user?.email_confirmed_at));
  if(!user) process.exitCode=4;
  else {
   const profile=await admin.from("profiles").select("country_code,roles").eq("id",user.id).maybeSingle();
   console.log("UAT_PROFILE_FOUND="+Boolean(profile.data)+" ROLE_COUNTRY_OK="+Boolean(profile.data?.country_code==="AR"&&profile.data?.roles?.includes("propietario")));
   if(profile.error || !profile.data?.roles?.includes("propietario"))process.exitCode=5;
   console.log("EMAIL_DELIVERY_STATUS=UNVERIFIED; Supabase acceptance is not proof of actual inbox receipt.");
   console.log("ACCOUNT_PRESERVED_FOR_MAILBOX_CONFIRMATION=YES; no credentials/tokens are logged.");
  }
 }
}
