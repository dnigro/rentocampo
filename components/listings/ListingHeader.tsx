interface Props {
  id?: string;
  title: string;
  description?: string;
  count: string;
}

export default function ListingHeader({
  id,
  title,
  description,
  count,
}: Props) {
  return (
    <header className="listing-header">
      <div>
        <h1 id={id} className="explorador-title">{title}</h1>
        {description && <p className="seo-listing-description">{description}</p>}
        <p className="explorador-count">{count}</p>
      </div>

    </header>
  );
}
