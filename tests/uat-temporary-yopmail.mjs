import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const email=process.env.UAT_TEST_EMAIL?.trim().toLowerCase();
const pub=process.env.UAT_SUPABASE_PUBLISHABLE_KEY;
const privateKey=process.env.UAT_SUPABASE_SERVICE_ROLE_KEY;
if(url!=="https://wibqszhvuvpjycheaxzi.supabase.co" || !pub || !privateKey || email!=="bucenti1234@yopmail.com")
 throw new Error("Safety check: isolated UAT, user-supplied email and dedicated credentials are required");
const admin=createClient(url,privateKey,{auth:{persistSession:false,autoRefreshToken:false}});
const client=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});
const pre=await admin.auth.admin.listUsers({page:1,perPage:1000});
if(pre.error)throw new Error("Cannot check UAT users: "+pre.error.message);
if(pre.data.users.some(x=>x.email?.toLowerCase()===email)) {
 console.log("BLOCKED_ALREADY_REGISTERED: no email signup attempted");
 process.exit(2);
}
const pwd=randomBytes(36).toString("base64url")+"Aa1!";
const {data,error}=await client.auth.signUp({
 email,password:pwd,
 options:{data:{nombre:"Prueba UAT Yopmail",tipo:"propietario",country_code:"AR"}}
});
if(error){
 console.log("SIGNUP_REJECTED code="+String(error.code||"unknown")+" status="+String(error.status||"unknown")+" message="+error.message);
 console.log("EMAIL_DELIVERY=NOT_SENT_BY_SUPABASE");
 process.exit(3);
}
console.log("SIGNUP_ACCEPTED has_user="+Boolean(data.user)+" has_session="+Boolean(data.session));
const post=await admin.auth.admin.listUsers({page:1,perPage:1000});
if(post.error)throw new Error("Cannot verify UAT account");
const registered=post.data.users.find(x=>x.email?.toLowerCase()===email);
console.log("UAT_ACCOUNT_CREATED="+Boolean(registered)+" EMAIL_CONFIRMED="+Boolean(registered?.email_confirmed_at));
console.log("EMAIL_DELIVERY=UNVERIFIED_CHECK_PUBLIC_TEST_INBOX; account preserved for confirmation.");
if(!registered)process.exit(4);
