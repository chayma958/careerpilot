export function ApplicationsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </svg>
  );
}
