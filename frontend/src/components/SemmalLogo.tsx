import React from 'react';
import Image from 'next/image';

interface SemmalLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SemmalLogo({ className = "", width = 64, height = 64 }: SemmalLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src={`/Semmal_Icon_Final.png?v=${Date.now()}`}
        alt="Semmal Icon"
        width={width}
        height={height}
        className="object-contain"
        style={{ width: width, height: height }}
        unoptimized={true}
        priority
      />
    </div>
  );
}
