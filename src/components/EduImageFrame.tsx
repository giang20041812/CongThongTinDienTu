import React from 'react';

interface EduImageFrameProps {
  label?: string;
  theme?: 'campus' | 'exam' | 'ceremony' | 'lab' | 'club' | 'lost' | 'general';
  aspectRatio?: '16:9' | '4:3' | '3:2' | '1:1' | 'compact' | 'full';
  className?: string;
  subLabel?: string;
  compact?: boolean;
}

export const EduImageFrame: React.FC<EduImageFrameProps> = ({
  label = 'ẢNH TIN',
  theme = 'general',
  aspectRatio = '4:3',
  className = '',
  subLabel,
  compact = false,
}) => {
  const aspectClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    '1:1': 'aspect-square',
    compact: 'h-16 sm:h-20 w-full',
    full: 'h-full w-full',
  }[aspectRatio];

  // Distinct geometric themes inspired by Vietnamese academic architecture
  const renderThemeGraphic = () => {
    switch (theme) {
      case 'campus':
        return (
          <svg className="w-full h-full opacity-35" viewBox="0 0 400 300" fill="none">
            {/* Campus building linework & flagpole */}
            <path d="M40 240 L360 240" stroke="#991B1B" strokeWidth="2" />
            <rect x="70" y="110" width="260" height="130" stroke="#991B1B" strokeWidth="1.5" fill="#FEF2F2" fillOpacity="0.4" />
            <polygon points="200,60 340,110 60,110" stroke="#991B1B" strokeWidth="2" fill="#FEE2E2" fillOpacity="0.5" />
            {/* Clock tower / pediment */}
            <circle cx="200" cy="85" r="12" stroke="#991B1B" strokeWidth="1.5" />
            <line x1="200" y1="85" x2="200" y2="78" stroke="#991B1B" strokeWidth="1.5" />
            <line x1="200" y1="85" x2="206" y2="85" stroke="#991B1B" strokeWidth="1.5" />
            {/* Classroom windows */}
            {[100, 140, 180, 220, 260].map((x) => (
              <React.Fragment key={x}>
                <rect x={x} y="130" width="24" height="30" stroke="#991B1B" strokeWidth="1" fill="#FFFFFF" />
                <rect x={x} y="180" width="24" height="30" stroke="#991B1B" strokeWidth="1" fill="#FFFFFF" />
              </React.Fragment>
            ))}
            {/* National flagpole motif */}
            <line x1="50" y1="240" x2="50" y2="60" stroke="#7F1D1D" strokeWidth="2" />
            <polygon points="50,60 85,75 50,90" fill="#DC2626" />
          </svg>
        );

      case 'exam':
        return (
          <svg className="w-full h-full opacity-35" viewBox="0 0 400 300" fill="none">
            {/* Academic papers, math matrices, geometry */}
            <rect x="60" y="60" width="160" height="200" stroke="#991B1B" strokeWidth="1.5" fill="#FFFFFF" />
            <line x1="80" y1="90" x2="190" y2="90" stroke="#991B1B" strokeWidth="1.5" />
            <line x1="80" y1="110" x2="180" y2="110" stroke="#991B1B" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="80" y1="130" x2="200" y2="130" stroke="#991B1B" strokeWidth="1" />
            <line x1="80" y1="150" x2="160" y2="150" stroke="#991B1B" strokeWidth="1" />
            {/* Matrix & compass */}
            <rect x="180" y="100" width="160" height="150" stroke="#991B1B" strokeWidth="1.5" fill="#FEF2F2" />
            <circle cx="260" cy="175" r="45" stroke="#991B1B" strokeWidth="1" strokeDasharray="4 2" />
            <polygon points="260,135 300,205 220,205" stroke="#DC2626" strokeWidth="1.5" />
            <circle cx="260" cy="175" r="3" fill="#991B1B" />
          </svg>
        );

      case 'lab':
        return (
          <svg className="w-full h-full opacity-35" viewBox="0 0 400 300" fill="none">
            {/* STEM laboratory beaker & circuit board */}
            <path d="M120 70 L140 130 L100 230 C90 245 100 255 120 255 L200 255 C220 255 230 245 220 230 L180 130 L200 70 Z" stroke="#991B1B" strokeWidth="2" fill="#FEF2F2" />
            <line x1="125" y1="180" x2="195" y2="180" stroke="#DC2626" strokeWidth="1.5" />
            <line x1="130" y1="200" x2="190" y2="200" stroke="#DC2626" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="160" cy="220" r="8" fill="#DC2626" fillOpacity="0.4" />
            {/* Atom rings */}
            <ellipse cx="280" cy="150" rx="60" ry="25" stroke="#991B1B" strokeWidth="1.5" transform="rotate(-30 280 150)" />
            <ellipse cx="280" cy="150" rx="60" ry="25" stroke="#991B1B" strokeWidth="1.5" transform="rotate(30 280 150)" />
            <circle cx="280" cy="150" r="10" fill="#991B1B" />
          </svg>
        );

      case 'club':
        return (
          <svg className="w-full h-full opacity-35" viewBox="0 0 400 300" fill="none">
            {/* Robotics gear, trophy, youth badge */}
            <circle cx="150" cy="150" r="60" stroke="#991B1B" strokeWidth="2" strokeDasharray="8 6" />
            <circle cx="150" cy="150" r="40" stroke="#991B1B" strokeWidth="1.5" fill="#FEF2F2" />
            <polygon points="150,120 160,140 180,142 165,155 170,175 150,165 130,175 135,155 120,142 140,140" fill="#DC2626" />
            {/* Robotic arm lines */}
            <path d="M230 220 L270 160 L320 180 L340 150" stroke="#991B1B" strokeWidth="2" />
            <rect x="330" y="140" width="20" height="20" stroke="#991B1B" strokeWidth="1.5" fill="#FFFFFF" />
          </svg>
        );

      case 'lost':
        return (
          <svg className="w-full h-full opacity-35" viewBox="0 0 200 200" fill="none">
            {/* Search target & document badge */}
            <rect x="40" y="30" width="120" height="140" stroke="#991B1B" strokeWidth="1.5" fill="#FFFFFF" />
            <circle cx="100" cy="80" r="22" stroke="#991B1B" strokeWidth="1.5" fill="#FEF2F2" />
            <line x1="60" y1="120" x2="140" y2="120" stroke="#991B1B" strokeWidth="1.5" />
            <line x1="60" y1="135" x2="120" y2="135" stroke="#991B1B" strokeWidth="1" strokeDasharray="2 2" />
            {/* Magnifying glass */}
            <circle cx="130" cy="130" r="25" stroke="#DC2626" strokeWidth="2" fill="#FFFFFF" />
            <line x1="148" y1="148" x2="175" y2="175" stroke="#DC2626" strokeWidth="3" />
          </svg>
        );

      default:
        return (
          <svg className="w-full h-full opacity-30" viewBox="0 0 400 300" fill="none">
            <line x1="0" y1="0" x2="400" y2="300" stroke="#991B1B" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="0" y2="300" stroke="#991B1B" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="200" cy="150" r="70" stroke="#991B1B" strokeWidth="1.5" fill="#FEF2F2" />
            <rect x="130" y="80" width="140" height="140" stroke="#991B1B" strokeWidth="1" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`group relative overflow-hidden bg-[#F7F5F0] border border-[#E5E0D8] group-hover:border-[#B91C1C] transition-all duration-300 ${aspectClasses} ${className}`}
    >
      {/* Background architectural pattern */}
      <div className="absolute inset-0 bg-edu-grid opacity-60" />

      {/* Dynamic technical thematic SVG illustration */}
      <div className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
        {renderThemeGraphic()}
      </div>

      {/* Modern Vietnamese Educational Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-[2px] bg-[#B91C1C]" />
      <div className="absolute top-0 left-0 w-[2px] h-3 bg-[#B91C1C]" />
      <div className="absolute bottom-0 right-0 w-3 h-[2px] bg-[#B91C1C]" />
      <div className="absolute bottom-0 right-0 w-[2px] h-3 bg-[#B91C1C]" />

      {/* Central Wireframe Label ("ẢNH TIN" / "ẢNH ĐỒ") */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${compact ? 'p-1' : 'p-3'} text-center`}>
        <span className={`font-sans font-bold tracking-wider text-[#991B1B] bg-white/90 border border-[#B91C1C]/40 shadow-xs ${compact ? 'text-[10px] sm:text-[11px] px-1.5 py-0.5' : 'text-base sm:text-lg px-3 py-1'}`}>
          {label}
        </span>
        {subLabel && (
          <span className={`font-mono tracking-wide text-[#78350F] bg-white/80 border border-stone-200 truncate max-w-[90%] ${compact ? 'text-[9px] px-1 py-0.2 mt-0.5' : 'text-[11px] px-2 py-0.5 mt-1'}`}>
            {subLabel}
          </span>
        )}
      </div>

      {/* Subtle bottom red gradient bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B91C1C] opacity-80" />
    </div>
  );
};
