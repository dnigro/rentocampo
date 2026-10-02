type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span
      className={`brand-wordmark brand-wordmark--text-only ${className}`.trim()}
      aria-label="RentoCampo"
    >
      <span className="brand-clean-copy">
        <span className="brand-clean-name">RentoCampo</span>
        <span className="brand-clean-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
