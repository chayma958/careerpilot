export function AuthHeroArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <polygon points="400,0 400,260 180,0" fill="white" fillOpacity="0.06" />
      <polygon points="0,600 0,320 260,600" fill="black" fillOpacity="0.08" />
      <polygon points="400,600 260,600 400,380" fill="white" fillOpacity="0.05" />
      <line x1="0" y1="140" x2="400" y2="-60" stroke="white" strokeOpacity="0.08" strokeWidth="1" />
      <line x1="0" y1="240" x2="400" y2="40" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
      <line x1="60" y1="600" x2="460" y2="300" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
    </svg>
  );
}
