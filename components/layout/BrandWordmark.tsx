import Image from "next/image";

type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <Image
        src="/logo-rentocampo-rc.svg"
        alt="RentoCampo"
        width={64}
        height={64}
        priority
        className="brand-logo-full"
      />
    </span>
  );
}
