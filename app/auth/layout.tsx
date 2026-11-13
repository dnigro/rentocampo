import { isV3Enabled } from "@/lib/v3-routing";
export default function AuthCallbackLayout({children}: {children: React.ReactNode}) {
 return isV3Enabled(process.env) ? <main className="auth-main">{children}</main> : children;
}
