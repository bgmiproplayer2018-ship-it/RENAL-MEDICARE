import React from 'react';

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
  // Height scale mapping
  const heightMap = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };

  const symbolSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
  };

  if (variant === 'symbol-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 190 190"
          className={`${symbolSizeMap[size]} shrink-0 drop-shadow-sm`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="symKidneyL" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="50%" stop-color="#005BBD" />
              <stop offset="100%" stop-color="#00357A" />
            </linearGradient>
            <linearGradient id="symKidneyR" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stop-color="#3B82F6" />
              <stop offset="50%" stop-color="#005BBD" />
              <stop offset="100%" stop-color="#003272" />
            </linearGradient>
            <linearGradient id="symHand" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stop-color="#22C55E" />
              <stop offset="50%" stop-color="#16A34A" />
              <stop offset="100%" stop-color="#15803D" />
            </linearGradient>
            <linearGradient id="symArch" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#DC2626" />
              <stop offset="100%" stop-color="#EF4444" />
            </linearGradient>
            <filter id="symShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#001840" flood-opacity="0.25" />
            </filter>
          </defs>

          <g transform="translate(0, 10)">
            {/* Protective Upper Red Arc */}
            <path d="M 28 85 A 64 64 0 0 1 154 85" stroke="url(#symArch)" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Left Kidney */}
            <g filter="url(#symShadow)">
              <path d="M 68 52 C 50 52 38 68 38 88 C 38 108 50 126 68 126 C 78 126 84 118 84 106 C 84 96 78 92 78 88 C 78 84 84 80 84 70 C 84 58 78 52 68 52 Z" 
                    fill="url(#symKidneyL)" />
              <path d="M 52 64 C 44 74 44 96 52 110" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </g>

            {/* Right Kidney */}
            <g filter="url(#symShadow)">
              <path d="M 114 52 C 132 52 144 68 144 88 C 144 108 132 126 114 126 C 104 126 98 118 98 106 C 98 96 104 92 104 88 C 104 84 98 80 98 70 C 98 58 104 52 114 52 Z" 
                    fill="url(#symKidneyR)" />
              <path d="M 130 64 C 138 74 138 96 130 110" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            </g>

            {/* Caring Protective Green Hand */}
            <g filter="url(#symShadow)">
              <path d="M 24 116 C 36 122 52 134 76 138 C 102 142 130 138 152 122 C 158 118 163 114 165 112 C 165 115 158 126 148 134 C 130 148 98 153 66 147 C 46 143 32 133 22 125 C 20 123 21 118 24 116 Z" 
                    fill="url(#symHand)" />
              <path d="M 40 120 C 48 124 58 126 70 128" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Visual Logo Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 190 190"
          className={`${symbolSizeMap[size]} shrink-0 drop-shadow-sm`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="brandKidneyL" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#005BBD" />
              <stop offset="100%" stopColor="#00357A" />
            </linearGradient>
            <linearGradient id="brandKidneyR" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#005BBD" />
              <stop offset="100%" stopColor="#003272" />
            </linearGradient>
            <linearGradient id="brandHand" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="50%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="brandArch" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="brandShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#001840" floodOpacity="0.25" />
            </filter>
          </defs>

          <g transform="translate(0, 10)">
            {/* Protective Upper Red Arc */}
            <path d="M 28 85 A 64 64 0 0 1 154 85" stroke="url(#brandArch)" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Left Kidney */}
            <g filter="url(#brandShadow)">
              <path d="M 68 52 C 50 52 38 68 38 88 C 38 108 50 126 68 126 C 78 126 84 118 84 106 C 84 96 78 92 78 88 C 78 84 84 80 84 70 C 84 58 78 52 68 52 Z" 
                    fill="url(#brandKidneyL)" />
              <path d="M 52 64 C 44 74 44 96 52 110" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
              <path d="M 74 80 C 71 85 71 93 74 98" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />
            </g>

            {/* Right Kidney */}
            <g filter="url(#brandShadow)">
              <path d="M 114 52 C 132 52 144 68 144 88 C 144 108 132 126 114 126 C 104 126 98 118 98 106 C 98 96 104 92 104 88 C 104 84 98 80 98 70 C 98 58 104 52 114 52 Z" 
                    fill="url(#brandKidneyR)" />
              <path d="M 130 64 C 138 74 138 96 130 110" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
              <path d="M 108 80 C 111 85 111 93 108 98" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />
            </g>

            {/* Caring Protective Green Hand */}
            <g filter="url(#brandShadow)">
              <path d="M 24 116 C 36 122 52 134 76 138 C 102 142 130 138 152 122 C 158 118 163 114 165 112 C 165 115 158 126 148 134 C 130 148 98 153 66 147 C 46 143 32 133 22 125 C 20 123 21 118 24 116 Z" 
                    fill="url(#brandHand)" />
              <path d="M 40 120 C 48 124 58 126 70 128" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            </g>
          </g>
        </svg>
      </div>

      {/* Brand Text Elements */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline tracking-tight font-black">
          <span className={`${isLight ? 'text-white' : 'text-[#005BBD]'} ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} tracking-wide`}>
            RENAL
          </span>
          <span className="text-[#16A34A] ml-1.5 font-extrabold ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} tracking-wide">
            MEDICITY
          </span>
        </div>
        {showTagline && (
          <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mt-0.5 ${isLight ? 'text-blue-100' : 'text-[#004085]'}`}>
            Kidney Care &amp; Dialysis Center
          </span>
        )}
      </div>
    </div>
  );
};
