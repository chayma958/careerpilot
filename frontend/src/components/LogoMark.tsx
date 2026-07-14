export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 48 48" fill="currentColor">
      <path d="M10 25.5 L38 10 L27 38 L23 27 L10 25.5Z" />
    </svg>
  );
}
