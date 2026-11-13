import { isV3Preview } from "@/lib/v3-routing";
import LiteHeader from "@/components/lite/LiteHeader";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
export default function Page() { return isV3Preview(process.env) ? <main className="auth-main"><ResetPasswordForm lite/></main> : <><LiteHeader/><ResetPasswordForm lite/></>; }
