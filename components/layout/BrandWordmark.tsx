type BrandWordmarkProps = {
  className?: string;
};

export default function BrandWordmark({ className = "" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark ${className}`.trim()} aria-label="RentoCampo">
      <svg className="brand-symbol brand-symbol-seal" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 43A25 25 0 0 1 47 12" fill="none" stroke="#74401f" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M48 13A25 25 0 0 1 56 37" fill="none" stroke="#426b35" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 43h43" fill="none" stroke="#073f30" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M14 47c11-4 23-5 37-3M18 53c9-4 19-5 29-4M25 58c6-3 12-4 18-3" fill="none" stroke="#f5bd00" strokeWidth="3.3" strokeLinecap="round" />
        <path d="M16 27c2.5-5.6 8.5-8.5 15.8-7.7 7.4.8 12.8 5.3 13.2 11.4.4 6.7-5.8 11.1-15.6 10.7-9.2-.4-15.8-5.7-13.4-14.4Z" fill="#74401f" />
        <path d="m18.5 24-2.4-8 7.4 5.1m16.1 1.7 5.9-5.4-.9 8.2" fill="#74401f" />
        <circle cx="38.5" cy="27.2" r="1.6" fill="#fff" />
        <path d="M47 39c4.5-6.3 8.5-6.5 11-5-1.2 4.9-4.6 7.4-11 7.3" fill="#426b35" />
        <path d="M46.8 41c2.5-4 3.3-7.2 3.5-10.3" fill="none" stroke="#426b35" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="brand-wordmark-copy">
        <span className="brand-wordmark-text">RentoCampo</span>
        <span className="brand-wordmark-tagline">Tierras que producen futuro</span>
      </span>
    </span>
  );
}
