import { redirect } from "next/navigation";

/** Legacy pack URL: new purchases are disabled during free publishing. */
export default function LegacyPackRoute() {
  redirect("/lite/campos/mis-publicaciones");
}
