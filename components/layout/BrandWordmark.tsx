import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span
      className={`brand-wordmark brand-wordmark--clean ${className}`.trim()}
      aria-label="RentoCampo"
    >
      <Image
        src="/icon.svg"
        alt=""
        width={96}
        height={96}
        priority
        className="brand-clean-logo"
        aria-hidden="true"
      />
      <span className="brand-clean-copy">
        <span className="brand-clean-name">RentoCampo</span>
        <span className="brand-clean-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
