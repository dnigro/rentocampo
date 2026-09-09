import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("q")?.trim();
  const lat = requestUrl.searchParams.get("lat");
  const lon = requestUrl.searchParams.get("lon");

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
    url.searchParams.set("countrycodes", "ar");
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
  return NextResponse.json({ results: query ? result : [result] });
}
