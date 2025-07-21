import { Typography } from "antd";
import React from "react";

export interface SquareButtonProps {
    title: string;
    icon: JSX.Element;
    size?: number;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    className?: string;
  }
  
export const SquareButton: React.FC<SquareButtonProps> = ({
    title,
    icon: Icon,
    size = 120,
    onClick,
    isActive = false,
    disabled = false,
    className = ''
  }) => {
    const handleClick = () => {
      if (!disabled) {
        onClick();
      }
    };
  
    return (
      <div
        className={`
          relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl
          cursor-pointer transition-all duration-300 ease-in-out transform group
          ${isActive 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-lg scale-105 ring-4 ring-blue-200 ring-opacity-50' 
            : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300 hover:scale-102'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-2xl'
          }
          ${className}
        `}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`
        }}
        onClick={handleClick}
        /* disabled={disabled} */
      >
        {/* Icon */}
        <div className={`
          flex items-center justify-center transition-all duration-300
          ${isActive 
            ? 'text-blue-500 scale-110' 
            : 'text-gray-600 group-hover:text-gray-800 group-hover:scale-105'
          }
        `}>
          {React.cloneElement(Icon, { size: size * 0.35})}
        </div>
  
        {/* Title */}
        <div className={`
          text-center font-medium text-xs transition-colors duration-300 leading-tight
          ${isActive 
            ? 'text-blue-700' 
            : 'text-gray-700 group-hover:text-gray-900'
          }
        `}>
          <Typography.Title level={3}>{title}</Typography.Title>
        </div>
  
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
  
        {/* Hover Glow Effect */}
        <div className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none
          ${isActive 
            ? 'bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-100' 
            : 'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'
          }
        `}></div>
      </div>
    );
  };