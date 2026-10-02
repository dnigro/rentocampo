import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <Image
        src="/icon.svg"
        alt=""
        width={72}
        height={72}
        priority
        className="brand-symbol-image"
        aria-hidden="true"
      />
      <span className="brand-wordmark-copy">
        <span className="brand-wordmark-text">
          <span className="brand-wordmark-rento">Rento</span>
          <span className="brand-wordmark-campo">Campo</span>
        </span>
        <span className="brand-wordmark-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
