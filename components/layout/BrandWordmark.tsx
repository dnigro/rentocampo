import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span
      className={`brand-wordmark brand-wordmark--overlap ${className}`.trim()}
      aria-label="RentoCampo"
    >
      <span className="brand-overlap-logo">
        <Image
          src="/logo-rentocampo-rc.svg"
          alt=""
          width={128}
          height={128}
          priority
          className="brand-full-logo"
          aria-hidden="true"
        />
      </span>

      <span className="brand-overlap-copy">
        <span className="brand-overlap-name">
          <strong>Rento</strong>
          <strong>Campo</strong>
        </span>
        <span className="brand-overlap-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
