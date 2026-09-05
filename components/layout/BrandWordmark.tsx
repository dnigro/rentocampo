type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <svg className="brand-symbol" viewBox="0 0 64 64" aria-hidden="true">
        <path className="brand-symbol-cow" d="M6 23.5c3.8-1 7.3-1 10.5-.2l5.8-5.8 4.2 5.1c4.9-1.2 10.2-1.2 15.6.2l5-4.8 2.1 7.2c5.6 3.7 8.8 9.4 8.8 16.3v7.2H17.7C10.7 48.7 6 44 6 37V23.5Zm35.7 8.1a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8ZM14 49.3h7V60h-7V49.3Zm30.2 0h7V60h-7V49.3Z" />
      </svg>
      <span className="brand-wordmark-text">RentoCampo</span>
    </span>
  );
}
