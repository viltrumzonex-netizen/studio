import type { SVGProps } from 'react';

export function ViltrumCoin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="viltrum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#viltrum-gradient)" />
      <path
        d="M9.6 8.5 12 7l2.4 1.5-1.2 4 1.2 4L12 17l-2.4-1.5 1.2-4z"
        stroke="url(#viltrum-gradient)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Bitcoin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.1 5.1a5 5 0 0 1 7.4 2.4" />
      <path d="M12.9 5.1a5 5 0 0 0-7.4 2.4" />
      <path d="M13.4 18.9a5 5 0 0 1-7.4-2.4" />
      <path d="M11.6 18.9a5 5 0 0 0 7.4-2.4" />
      <path d="m12 15.5 2-2.5-2-2.5" />
      <path d="m10 15.5 2-2.5-2-2.5" />
      <path d="M12 15.5v-1" />
      <path d="M12 9.5v-1" />
      <path d="M7 10.5h1" />
      <path d="M16 10.5h1" />
      <path d="M7 13.5h1" />
      <path d="M16 13.5h1" />
    </svg>
  );
}

export function Ethereum(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 6 12l6 9 6-9Z" />
      <path d="m6 12 6-3 6 3" />
      <path d="M12 21V9" />
    </svg>
  );
}

export function UsdCoin(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4h-6" />
            <path d="M12 18V6" />
        </svg>
    )
}