import Link from "next/link";
import { MapPinned, ListFilter } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import ListingCountrySelector from "@/components/listings/ListingCountrySelector";

interface Props {
  country: CountryCode;
  count: string;
  mapHref: string;
  mapLabel: string;
  relatedHref: string;
  relatedLabel: string;
  ariaLabel: string;
}

export default function ListingExplorerToolbar({
  country, count, mapHref, mapLabel, relatedHref, relatedLabel, ariaLabel,
}: Props) {
  return (
    <nav className="rc-explorer-toolbar" aria-label={ariaLabel}>
      <Link className="rc-explorer-toolbar__map" href={mapHref}>
        <MapPinned size={19} strokeWidth={2.15} aria-hidden="true" />
        {mapLabel}
      </Link>
      <ListingCountrySelector country={country} />
      <Link className="rc-explorer-toolbar__related" href={relatedHref}><ListFilter size={19} strokeWidth={2.15} aria-hidden="true" />{relatedLabel}</Link>
      <a className="rc-explorer-toolbar__count" href="#rc-explorer-results" aria-label={count}>{count}<span aria-hidden="true">↓</span></a>
    </nav>
  );
}
