import React from 'react';

interface BackgroundGeometricMeshProps {
  variant?: 'grid' | 'dots' | 'schematic' | 'subtle';
  className?: string;
}

export const BackgroundGeometricMesh: React.FC<BackgroundGeometricMeshProps> = ({
  variant = 'grid',
  className = '',
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Background Architectural Grid Pattern */}
      {variant === 'grid' && (
        <div className="absolute inset-0 bg-edu-grid opacity-80" />
      )}

      {variant === 'dots' && (
        <div className="absolute inset-0 bg-dot-matrix opacity-70" />
      )}

      {variant === 'schematic' && (
        <div className="absolute inset-0 bg-blueprint-lines opacity-60" />
      )}

      {/* Floating subtle modern geometric elements to fill empty negative space */}
      <svg
        className="animate-slow-drift absolute top-12 right-12 w-64 h-64 text-black opacity-[0.045]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="100" cy="100" r="80" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="50" />
        <polygon points="100,20 180,180 20,180" />
        <line x1="20" y1="100" x2="180" y2="100" strokeDasharray="2 2" />
        <line x1="100" y1="20" x2="100" y2="180" strokeDasharray="2 2" />
      </svg>

      <svg
        className="animate-slow-drift-reverse absolute bottom-16 left-8 w-72 h-72 text-[#1C1917] opacity-[0.035]"
        viewBox="0 0 240 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="20" y="20" width="200" height="200" />
        <rect x="40" y="40" width="160" height="160" strokeDasharray="3 3" />
        <line x1="20" y1="20" x2="220" y2="220" />
        <line x1="220" y1="20" x2="20" y2="220" />
        <circle cx="120" cy="120" r="30" />
      </svg>

      {/* Subtle modern cross markers at corners for architectural rigor */}
      <div className="absolute top-4 left-4 text-black opacity-20 font-mono text-[10px]">
        +
      </div>
      <div className="absolute top-4 right-4 text-black opacity-20 font-mono text-[10px]">
        +
      </div>
      <div className="absolute bottom-4 left-4 text-black opacity-20 font-mono text-[10px]">
        +
      </div>
      <div className="absolute bottom-4 right-4 text-black opacity-20 font-mono text-[10px]">
        +
      </div>

      {/* Hairline horizontal laser accent */}
      <div className="animate-pulse-laser absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0052cc]/10 to-transparent" />
    </div>
  );
};

