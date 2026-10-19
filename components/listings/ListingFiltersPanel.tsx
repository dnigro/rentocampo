"use client";

import { useId, useState, type ReactNode } from "react";

interface Props {
  title: string;
  activeCount: number;
  children: ReactNode;
}

export default function ListingFiltersPanel({ title, activeCount, children }: Props) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  return (
    <aside className="rc-explorer-filters" aria-label={title}>
      <button
        type="button"
        className="rc-explorer-filters__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded(value => !value)}
      >
        <span>{title}{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div id={panelId} className={`rc-explorer-filters__body${expanded ? " is-open" : ""}`}>
        {children}
      </div>
    </aside>
  );
}
