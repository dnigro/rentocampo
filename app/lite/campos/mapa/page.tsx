import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "vista" && key !== "servicio") query.set(key, value);
  }
  redirect("/campos" + (query.size ? "?" + query.toString() : ""));
}
