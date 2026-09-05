type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <svg className="brand-symbol" viewBox="0 0 64 64" aria-hidden="true">
        <path className="brand-symbol-pin" d="M24 4C13.5 4 5 12.4 5 22.8c0 14 19 31.2 19 31.2s19-17.2 19-31.2C43 12.4 34.5 4 24 4Zm0 27.2a8.4 8.4 0 1 1 0-16.8 8.4 8.4 0 0 1 0 16.8Z" />
        <path className="brand-symbol-field" d="M22 38.5C33.8 29.4 45.3 27 60 28.3v7.2C45.9 34.3 35.2 36.8 25.2 44.6L22 38.5Zm5.1 9.4c10.5-7.1 20.7-9.3 32.9-8.1V47c-10.7-1-19.5 1-28.8 7.1l-4.1-6.2Zm8.3 9.5c7.6-4.2 15.3-5.5 24.6-4.5V60c-7.4-.8-13.7.2-20.2 3.8l-4.4-6.4Z" />
      </svg>
      <span className="brand-wordmark-text">RentoCampo</span>
    </span>
  );
}
