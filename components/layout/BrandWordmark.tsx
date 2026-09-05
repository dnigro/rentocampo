import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <Image
        src="/logo-rentocampo-oficial.png"
        alt=""
        width={64}
        height={64}
        priority
        className="brand-symbol-image"
        aria-hidden="true"
      />
      <span className="brand-wordmark-copy">
        <span className="brand-wordmark-text">RentoCampo</span>
        <span className="brand-wordmark-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
