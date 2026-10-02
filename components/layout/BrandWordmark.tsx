import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark brand-wordmark--full-logo ${className}`.trim()} aria-label="RentoCampo">
      <Image
        src="/logo-rentocampo-rc.svg"
        alt="RentoCampo"
        width={118}
        height={118}
        priority
        className="brand-full-logo"
      />
    </span>
  );
}
