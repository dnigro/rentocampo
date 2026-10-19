"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COUNTRIES, COUNTRY_CODES, resolveCountry, type CountryCode } from "@/data/countries";
import { selectRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";

export default function ListingCountrySelector({ country }: { country: CountryCode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = resolveCountry(searchParams.get("pais"), country);

  function change(next: CountryCode) {
    if (next === selected) return;
    selectRegionalCountry(next);
    const params = new URLSearchParams(window.location.search);
    params.set("pais", next);
    for (const key of ["provincia", "departamento", "region", "localidad", "page"]) params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="rc-explorer-country">
      <label htmlFor="listing-country">{regionalText(selected, "País", "País")}</label>
      <select id="listing-country" aria-label={regionalText(selected, "Seleccionar país de publicaciones", "Selecionar país dos anúncios")} value={selected} onChange={(event) => change(event.target.value as CountryCode)}>
        {COUNTRY_CODES.map(code => <option value={code} key={code}>{COUNTRIES[code].flag} {COUNTRIES[code].name}</option>)}
      </select>
    </div>
  );
}
