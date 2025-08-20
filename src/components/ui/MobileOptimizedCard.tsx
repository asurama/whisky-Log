'use client';

import { useState } from 'react';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function MobileOptimizedCard({ 
  children, 
  onClick, 
  className = '', 
  style = {} 
}: MobileOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    onClick?.();
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onClick?.();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <div
      className={`mobile-card ${className}`}
      style={{
        ...style,
        transform: isPressed ? 'scale(0.96)' : isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: isPressed 
          ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
          : isHovered 
          ? '0 8px 16px rgba(0, 0, 0, 0.2)' 
          : '0 4px 8px rgba(0, 0, 0, 0.1)',
        opacity: isPressed ? 0.9 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
} 