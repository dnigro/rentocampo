import { isV3Enabled } from "@/lib/v3-routing";
import LiteHeader from "@/components/lite/LiteHeader";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
export default function Page() { return isV3Enabled(process.env) ? <main className="auth-main"><ResetPasswordForm lite/></main> : <><LiteHeader/><ResetPasswordForm lite/></>; }
