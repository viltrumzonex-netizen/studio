import type { SVGProps } from 'react';

export function ViltrumLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
    >
      <defs>
        <linearGradient
          id="viltrum-gradient"
          x1="0"
          y1="0"
          x2="256"
          y2="256"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient
          id="viltrum-bars-gradient"
          x1="128"
          y1="64"
          x2="128"
          y2="192"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC4899" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle
        cx="128"
        cy="128"
        r="114"
        stroke="url(#viltrum-gradient)"
        strokeWidth="20"
      />
      <path
        fill="url(#viltrum-bars-gradient)"
        d="M93.5 176.5L118 192V64L93.5 79.5V176.5Z"
      />
      <path
        fill="url(#viltrum-bars-gradient)"
        d="M125 192H141V64H125V192Z"
      />
      <path
        fill="url(#viltrum-bars-gradient)"
        d="M162.5 152L171 156.5V99.5L162.5 104V152Z"
      />
    </svg>
  );
}

export function ViltrumCoin(props: SVGProps<SVGSVGElement>) {
  return <ViltrumLogo {...props} />;
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
