import React, { useState, useRef, useEffect } from 'react';
import type { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({ children, content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = (e: MouseEvent) => {
    if (tooltipRef.current) {
      const offset = 10;
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;
      
      // Ensure tooltip stays within viewport
      const x = Math.min(
        e.clientX + offset,
        window.innerWidth - tooltipWidth - offset
      );
      const y = Math.min(
        e.clientY + offset,
        window.innerHeight - tooltipHeight - offset
      );
      
      setPosition({ x, y });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isVisible) {
        updateTooltipPosition(e);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={(e) => {
        setIsVisible(true);
        updateTooltipPosition(e.nativeEvent);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 
            max-w-xs transition-opacity duration-200 ${className}`}
          style={{
            left: position.x,
            top: position.y,
            opacity: isVisible ? 1 : 0,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};