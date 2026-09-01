type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <span className="brand-wordmark-rento">Rento</span>
      <span className="brand-wordmark-campo">Campo</span>
    </span>
  );
}
