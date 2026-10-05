import Link from "next/link";

interface Props {
  id?: string;
  title: string;
  description?: string;
  count: string;
  mapHref: string;
  publishHref: string;
  publishLabel: string;
  secondaryPublishHref?: string;
  secondaryPublishLabel?: string;
}

export default function ListingHeader({
  id,
  title,
  description,
  count,
  mapHref,
  publishHref,
  publishLabel,
  secondaryPublishHref,
  secondaryPublishLabel,
}: Props) {
  return (
    <header className="listing-header">
      <div>
        <h1 id={id} className="explorador-title">{title}</h1>
        {description && <p className="seo-listing-description">{description}</p>}
        <p className="explorador-count">{count}</p>
      </div>
      <div className="listing-actions">
        <Link href={mapHref} className="listing-button">Ver en mapa →</Link>
        <Link href={publishHref} className="listing-button">{publishLabel} →</Link>
        {secondaryPublishHref && secondaryPublishLabel && (
          <Link href={secondaryPublishHref} className="listing-button">{secondaryPublishLabel} →</Link>
        )}
      </div>
    </header>
  );
}
