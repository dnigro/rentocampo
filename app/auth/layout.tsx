import { isV3Preview } from "@/lib/v3-routing";
export default function AuthCallbackLayout({children}: {children: React.ReactNode}) {
 return isV3Preview(process.env) ? <main className="auth-main">{children}</main> : children;
}
