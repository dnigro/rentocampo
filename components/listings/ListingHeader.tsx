interface Props {
  id?: string;
  title: string;
  description?: string;
  count: string;
  eyebrow?: string;
}

export default function ListingHeader({
  id,
  title,
  description,
  count,
  eyebrow = "EXPLORÁ RENTO CAMPO",
}: Props) {
  return (
    <header className="listing-header rc-explorer-header">
      <div className="rc-explorer-header__copy">
        <p className="rc-explorer-header__eyebrow">{eyebrow}</p>
        <h1 id={id} className="explorador-title">{title}</h1>
        {description && <p className="rc-explorer-header__description">{description}</p>}
      </div>
      <span className="rc-explorer-header__count" role="status" aria-live="polite">{count}</span>
    </header>
  );
}
