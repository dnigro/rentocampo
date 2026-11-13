export default function V3DetailFacts({ facts }: { facts: { label: string; value: string | null | undefined }[] }) {
 return <dl className="v3-detail-facts">{facts.filter(fact => fact.value != null && fact.value !== "").map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>;
}
