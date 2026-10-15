import { NextResponse } from "next/server";
import { resolveCountry } from "@/data/countries";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("q")?.trim();
  const lat = requestUrl.searchParams.get("lat");
  const lon = requestUrl.searchParams.get("lon");
  const country = resolveCountry(requestUrl.searchParams.get("country")?.toUpperCase());

  if (!query && (!lat || !lon)) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(
    query
      ? "https://nominatim.openstreetmap.org/search"
      : "https://nominatim.openstreetmap.org/reverse",
  );
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  if (query) {
    if (query.length < 2) return NextResponse.json({ results: [] });
    url.searchParams.set("q", query);
    url.searchParams.set("countrycodes", country.toLowerCase());
    url.searchParams.set("limit", "10");
  } else {
    url.searchParams.set("lat", lat!);
    url.searchParams.set("lon", lon!);
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "RentoCampo/1.0 (location search)" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "No se pudieron buscar ubicaciones" },
      { status: 502 },
    );
  }

  const result = await response.json();
  const results = (query ? result : [result]) as { address?: { country_code?: string } }[];
  return NextResponse.json({ results: results.filter((item) => item.address?.country_code?.toUpperCase() === country) });
}
