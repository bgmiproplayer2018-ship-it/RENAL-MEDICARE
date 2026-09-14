import React, { useId } from 'react';

interface RenalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol-only' | 'light' | 'stacked';
  showTagline?: boolean;
}

export const RenalLogo: React.FC<RenalLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = true,
}) => {
  const uniqueId = useId().replace(/:/g, '_');

  const symbolSizeMap = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-11 h-11 sm:w-12 sm:h-12',
    xl: 'w-16 h-16',
  };

  const isLight = variant === 'light';
  const isStacked = variant === 'stacked';

  // SVG Emblem Graphic Matching User's Real Emblem
  const renderEmblem = (sizeClass: string) => (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeClass} shrink-0 drop-shadow-sm`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Tapered Red Protective Arch */}
        <linearGradient id={`${uniqueId}_arch`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="35%" stopColor="#DC2626" />
          <stop offset="85%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>

        {/* 3D Glossy Left Kidney */}
        <linearGradient id={`${uniqueId}_kidneyL`} x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="25%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#1D4ED8" />
          <stop offset="85%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* 3D Glossy Right Kidney */}
        <linearGradient id={`${uniqueId}_kidneyR`} x1="85%" y1="15%" x2="15%" y2="85%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="30%" stopColor="#2563EB" />
          <stop offset="65%" stopColor="#1D4ED8" />
          <stop offset="90%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Descending Ureters / Vessels */}
        <linearGradient id={`${uniqueId}_ureter`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="30%" stopColor="#3B82F6" />
          <stop offset="70%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Caring Green Hand Gradient */}
        <linearGradient id={`${uniqueId}_hand`} x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="30%" stopColor="#047857" />
          <stop offset="75%" stopColor="#065F46" />
          <stop offset="100%" stopColor="#022C22" />
        </linearGradient>

        {/* Specular Gloss Gradient */}
        <linearGradient id={`${uniqueId}_gloss`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>

        {/* 3D Bevel & Drop Shadow Filter */}
        <filter id={`${uniqueId}_shadow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>
      </defs>

      <g transform="translate(0, 4)" filter={`url(#${uniqueId}_shadow)`}>
        {/* 1. Tapered Red Protective Arch */}
        <path
          d="M 32 86 C 39 46 66 23 100 23 C 134 23 161 46 168 86 C 163 83 140 32 100 32 C 60 32 37 83 32 86 Z"
          fill={`url(#${uniqueId}_arch)`}
        />

        {/* 2. Descending Ureters / Renal Vessels into the Hand */}
        <path
          d="M 85 82 C 92 90 95 104 96 128"
          stroke={`url(#${uniqueId}_ureter)`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 115 82 C 108 90 105 104 104 128"
          stroke={`url(#${uniqueId}_ureter)`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M 84 81 C 92 78 108 78 116 81"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 3. Left 3D Kidney */}
        <g>
          <path
            d="M 82 44 C 62 44 48 58 48 80 C 48 102 62 118 78 118 C 86 118 90 110 90 100 C 90 92 84 88 84 82 C 84 76 90 70 90 58 C 90 48 88 44 82 44 Z"
            fill={`url(#${uniqueId}_kidneyL)`}
          />
          {/* Outer Curved Gloss Highlight */}
          <path
            d="M 58 56 C 52 66 52 86 60 98"
            stroke={`url(#${uniqueId}_gloss)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Inner Hilum Contour */}
          <path
            d="M 76 74 C 73 78 73 86 76 90"
            stroke="#93C5FD"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>

        {/* 4. Right 3D Kidney */}
        <g>
          <path
            d="M 118 44 C 138 44 152 58 152 80 C 152 102 138 118 122 118 C 114 118 110 110 110 100 C 110 92 116 88 116 82 C 116 76 110 70 110 58 C 110 48 112 44 118 44 Z"
            fill={`url(#${uniqueId}_kidneyR)`}
          />
          {/* Outer Curved Gloss Highlight */}
          <path
            d="M 142 56 C 148 66 148 86 140 98"
            stroke={`url(#${uniqueId}_gloss)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Inner Hilum Contour */}
          <path
            d="M 124 74 C 127 78 127 86 124 90"
            stroke="#93C5FD"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>

        {/* 5. Caring Human Hand in Emerald Green Cradling Kidneys */}
        <g>
          <path
            d="M 36 142 C 45 135 56 128 66 125 C 74 122 82 121 88 123 C 86 126 80 129 74 131 C 84 131 94 133 102 134 C 116 135 130 131 142 124 C 148 120 154 115 156 112 C 158 114 156 120 152 126 C 146 134 135 142 120 148 C 102 154 78 155 58 150 C 48 147 40 144 36 142 Z"
            fill={`url(#${uniqueId}_hand)`}
          />
          {/* Finger Crest Highlight */}
          <path
            d="M 98 134 C 114 135 130 131 144 123 C 150 119 155 114 156 112"
            stroke="#6EE7B7"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Thumb Crease */}
          <path
            d="M 64 126 C 72 122 80 122 86 124"
            stroke="#A7F3D0"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Finger Separation Lines */}
          <path
            d="M 124 136 L 138 126"
            stroke="#047857"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 134 140 L 146 128"
            stroke="#047857"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </g>
    </svg>
  );

  // Symbol Only Variant
  if (variant === 'symbol-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(symbolSizeMap[size])}
      </div>
    );
  }

  // Stacked Centered Badge Variant (Matches the exact layout in user's photo!)
  if (isStacked) {
    return (
      <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
        {renderEmblem(size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-18 h-18' : size === 'xl' ? 'w-24 h-24' : 'w-14 h-14')}
        
        <div className="mt-1.5 flex items-baseline justify-center tracking-tight font-black">
          <span className={`${isLight ? 'text-white' : 'text-[#0F3875]'} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base sm:text-lg'} tracking-wide`}>
            RENAL
          </span>
          <span className={`text-[#047857] ml-1 font-black ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base sm:text-lg'} tracking-wide`}>
            MEDICARE
          </span>
        </div>

        {showTagline && (
          <span className={`text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.18em] uppercase mt-0.5 ${isLight ? 'text-blue-200' : 'text-[#0F2F64]'}`}>
            Kidney Care &amp; Dialysis Center
          </span>
        )}
      </div>
    );
  }

  // Default Horizontal Full Variant
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Visual Logo Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {renderEmblem(symbolSizeMap[size])}
      </div>

      {/* Brand Text Elements */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline tracking-tight font-black">
          <span className={`${isLight ? 'text-white' : 'text-[#0F3875]'} ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} tracking-tight font-black`}>
            RENAL
          </span>
          <span className={`text-[#047857] ml-1 font-black ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} tracking-tight`}>
            MEDICARE
          </span>
        </div>
        {showTagline && (
          <span className={`text-[8px] sm:text-[9px] font-extrabold tracking-[0.12em] uppercase mt-0.5 ${isLight ? 'text-blue-100' : 'text-[#0F2F64]'}`}>
            Kidney Care &amp; Dialysis Center
          </span>
        )}
      </div>
    </div>
  );
};
