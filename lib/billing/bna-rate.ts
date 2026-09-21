export interface BnaUsdRate {
  seller: number;
  source: "BNA";
  fetchedAt: string;
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getBnaUsdSellerRate(): Promise<BnaUsdRate> {
  const response = await fetch("https://www.bna.com.ar/Personas", {
    headers: {
      Accept: "text/html",
      "User-Agent": "RentoCampo/1.0",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la cotización del Banco Nación");
  }

  const html = await response.text();
  const text = htmlToText(html);

  const match = text.match(
    /Dolar\s+U\.S\.A\s+([\d.,]+)\s+([\d.,]+)/i,
  );

  if (!match?.[2]) {
    throw new Error("No se pudo interpretar la cotización del Banco Nación");
  }

  const seller = Number(
    match[2]
      .replace(/\./g, "")
      .replace(",", "."),
  );

  if (!Number.isFinite(seller) || seller <= 0) {
    throw new Error("Cotización BNA inválida");
  }

  return {
    seller,
    source: "BNA",
    fetchedAt: new Date().toISOString(),
  };
}

export function usdToArs(usd: number, sellerRate: number) {
  return Math.round(usd * sellerRate);
}
