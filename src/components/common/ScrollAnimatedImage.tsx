import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageOff } from 'lucide-react';

export interface ScrollAnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  animation?: 'scale-in' | 'fade-up' | 'slide-left' | 'slide-right' | 'pop';
  delay?: number;
  duration?: number;
  threshold?: number;
  hoverZoom?: boolean;
  priority?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ScrollAnimatedImage: React.FC<ScrollAnimatedImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  animation = 'scale-in',
  delay = 0,
  duration = 0.75,
  threshold = 0.15,
  hoverZoom = true,
  priority = false,
  onClick,
  children,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Animation variants
  const getVariants = () => {
    switch (animation) {
      case 'fade-up':
        return {
          hidden: { opacity: 0, y: 32, scale: 0.98 },
          visible: { opacity: 1, y: 0, scale: 1 }
        };
      case 'slide-left':
        return {
          hidden: { opacity: 0, x: 36, scale: 0.98 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      case 'slide-right':
        return {
          hidden: { opacity: 0, x: -36, scale: 0.98 },
          visible: { opacity: 1, x: 0, scale: 1 }
        };
      case 'pop':
        return {
          hidden: { opacity: 0, scale: 0.88, y: 15 },
          visible: { opacity: 1, scale: 1, y: 0 }
        };
      case 'scale-in':
      default:
        return {
          hidden: { opacity: 0, scale: 0.94, y: 20 },
          visible: { opacity: 1, scale: 1, y: 0 }
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      className={`relative overflow-hidden ${containerClassName}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: priority ? 0 : threshold }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      onClick={onClick}
    >
      {/* Subtle loading shimmer placeholder before image loads */}
      {!hasLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/70 animate-pulse z-0" />
      )}

      {hasError ? (
        <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
          <ImageOff className="w-8 h-8 mb-2 stroke-1" />
          <span className="text-xs font-medium">{alt || 'Clinical photo unavailable'}</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-transform duration-700 ease-out ${
            hoverZoom ? 'group-hover:scale-105 hover:scale-105' : ''
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Gentle shine reflection highlight passing on reveal */}
      <motion.div
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full"
        initial={{ x: '-100%' }}
        whileInView={{ x: '100%' }}
        viewport={{ once: true, amount: priority ? 0 : threshold }}
        transition={{ duration: 1.1, delay: delay + 0.15, ease: 'easeInOut' }}
      />

      {/* Embedded overlays / badges passed as children */}
      {children}
    </motion.div>
  );
};
