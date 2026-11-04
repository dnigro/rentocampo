import type { SVGProps } from "react";

/**
 * Íconos de acciones RentoCampo.
 * Set único para tarjetas de web, web móvil y App Lite.
 * No representa ni reemplaza el escudo RC / favicon oficial.
 */
export type ActionIconName =
  | "report" | "profile" | "fields" | "services" | "favorites" | "messages";

type Props = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: ActionIconName;
  size?: number;
};

export default function ActionIcon({ name, size = 32, ...props }: Props) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 32 32" fill="none"
      stroke="currentColor" strokeWidth={2.15}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...props}
    >
      {name === "report" && (
        <>
          <path d="M4 26.5H28" />
          <path d="M6.5 23V18.5h4V23M14 23v-7h4v7M21.5 23V12.5h4V23" />
          <path d="m6.5 12.5 6-4 6 3 7-6" />
          <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="18.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="25.5" cy="5.5" r="1" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "profile" && (
        <>
          <circle cx="16" cy="10.5" r="5.5" />
          <path d="M5.5 27v-2c0-5.4 4.3-9 10.5-9s10.5 3.6 10.5 9v2Z" />
        </>
      )}
      {name === "fields" && (
        <>
          <path d="M16 3.5a5.5 5.5 0 0 0-5.5 5.5c0 4 5.5 9.5 5.5 9.5S21.5 13 21.5 9A5.5 5.5 0 0 0 16 3.5Z" />
          <circle cx="16" cy="9" r="1.7" />
          <path d="M3 23.5c6.4-2.2 13.6-2.3 26 0M3 28.5c5.4-2.5 9-3.4 13-4.3M13 29c4-3.7 8.2-5.2 16-5.5M22 29c2.5-1.9 4.5-3 7-3.5" />
        </>
      )}
      {name === "services" && (
        <>
          <path d="m7.3 5.5 5.6 5.6-2 2-5.6-5.6a4.5 4.5 0 0 0 5.2 6.6l11 11a3 3 0 1 0 4.2-4.2l-11-11a4.5 4.5 0 0 0-6.6-5.4Z" />
          <path d="m10.5 20.5-4.9 4.9a3 3 0 0 0 4.2 4.2l5.6-5.6" />
          <path d="M20 10.7 26.5 4l2 2-6.4 6.6" />
        </>
      )}
      {name === "favorites" && (
        <path d="M16 27 5.6 17.2C-2.1 9.2 9.2 1.6 16 8.6c6.8-7 18.1.6 10.4 8.6Z" />
      )}
      {name === "messages" && (
        <>
          <path d="M21 23.2c-1.7.8-3.5 1.2-5.5 1.2-1.9 0-3.7-.4-5.3-1.2L4 27l1.7-6.6A10.3 10.3 0 0 1 3 13.4C3 7.7 8.4 3 15.5 3S28 7.7 28 13.4c0 2.4-.9 4.7-2.4 6.6" />
          <path d="M24.5 13.5c2.9 1.5 4.5 4.1 4.5 7 0 2.1-.8 4-2.2 5.4l1 3.1-3.5-1.7c-1.5.8-3.1 1.2-4.8 1.2-1.8 0-3.5-.5-4.7-1.3" />
          <circle cx="10" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="22" cy="14" r="1" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
