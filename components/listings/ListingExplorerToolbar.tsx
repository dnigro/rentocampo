import Link from "next/link";
import type { CountryCode } from "@/data/countries";
import ListingCountrySelector from "@/components/listings/ListingCountrySelector";

interface Props {
  country: CountryCode;
  mapHref: string;
  mapLabel: string;
  relatedHref: string;
  relatedLabel: string;
  ariaLabel: string;
}

export default function ListingExplorerToolbar({
  country, mapHref, mapLabel, relatedHref, relatedLabel, ariaLabel,
}: Props) {
  return (
    <nav className="rc-explorer-toolbar" aria-label={ariaLabel}>
      <Link className="rc-explorer-toolbar__map" href={mapHref}>
        {mapLabel} <span aria-hidden="true">↗</span>
      </Link>
      <ListingCountrySelector country={country} />
      <Link className="rc-explorer-toolbar__related" href={relatedHref}>{relatedLabel}</Link>
    </nav>
  );
}
