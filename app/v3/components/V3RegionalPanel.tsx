import { ChevronDown } from "lucide-react";
import DemandaZonasPanel from "@/components/campos/DemandaZonasPanel";
import { displayCountryName, type CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import type { PublicationKind } from "@/lib/publicacion-regional";

export default function V3RegionalPanel({ country, kind, provincia, collapsed = false }: {
  country: CountryCode;
  kind: PublicationKind;
  provincia?: string;
  collapsed?: boolean;
}) {
  const panel = <DemandaZonasPanel country={country} kind={kind} provincia={provincia} authenticated={false} entryMode="protected" />;
  if (!collapsed) return <div className="v3-regional-panel">{panel}</div>;
  return (
    <details className="v3-regional-panel v3-regional-disclosure">
      <summary>
        {regionalText(country, "Regiones productivas de", "Regiões produtivas de", "Productive regions in")} {displayCountryName(country, country)}
        <ChevronDown size={20} aria-hidden="true" />
      </summary>
      {panel}
    </details>
  );
}
