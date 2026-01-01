import type { SVGProps } from 'react';

// This component is kept for the loading skeleton, but is no longer the primary icon.
export function ViltrumCoin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
    >
      <defs>
        <linearGradient
          id="coin-gradient"
          x1="0"
          y1="0"
          x2="256"
          y2="256"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="110" fill="url(#coin-gradient)" />
      <circle cx="128" cy="128" r="118" stroke="url(#coin-gradient)" strokeOpacity="0.5" strokeWidth="20" />
      <path d="M102 96L116 88V168L102 160V96Z" fill="white" fillOpacity="0.8"/>
      <path d="M119 88H137V168H119V88Z" fill="white" fillOpacity="0.8"/>
      <path d="M140 104L154 96V160L140 168V104Z" fill="white" fillOpacity="0.8"/>
    </svg>
  );
}
