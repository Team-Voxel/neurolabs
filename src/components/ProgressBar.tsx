import { Typography } from 'antd';
import React from 'react';

export interface CircularProgressBarProps {
    progress: number;
    size?: number;
    thickness?: number;
    className?: string;
    showPercentage?: boolean;
    animate?: boolean;
    duration?: number;
  }
  
  export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
    progress,
    size = 120,
    thickness = 8,
    className = '',
    showPercentage = true,
    animate = true,
    duration = 1000
  }) => {
    // Ensure progress is between 0 and 1
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    
    // Calculate dimensions
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (normalizedProgress * circumference);
    
    // Center coordinates
    const center = size / 2;
    
    // Percentage for display
    const percentage = Math.round(normalizedProgress * 100);
  
    return (
      <div 
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {/* SVG Progress Circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-sm"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness}
            fill="none"
            className="text-gray-200 transition-colors duration-300"
          />
          
          {/* Progress Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all ease-out ${animate ? `duration-[${duration}ms]` : 'duration-300'}`}
            style={{
              transitionDuration: animate ? `${duration}ms` : '300ms'
            }}
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            
            {/* Glow Effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
        
        {/* Percentage Text */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span 
                className={`font-bold text-gray-700 transition-all duration-300 ${
                  size <= 80 ? 'text-sm' : 
                  size <= 120 ? 'text-lg' : 
                  size <= 160 ? 'text-xl' : 
                  'text-2xl'
                }`}
                style={{fontFamily: 'inter, sans-serif'}}
              >
                {percentage}
              </span>
              <span 
                className={`font-medium text-gray-500 ${
                  size <= 80 ? 'text-xs' : 
                  size <= 120 ? 'text-sm' : 
                  size <= 160 ? 'text-base' : 
                  'text-lg'
                }`}
                style={{fontFamily: 'inter, sans-serif'}}
              >
                %
              </span>
            </div>
          </div>
        )}
        
        {/* Subtle glow effect for completed progress */}
        {normalizedProgress >= 1 && (
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
              filter: 'blur(2px)'
            }}
          />
        )}
      </div>
    );
  };



  export interface CircularProgressBar2Props {
    progress: number; // 0 to 100
    size?: number; // diameter in pixels
    thickness?: number; // stroke width in pixels
    color?: string; // progress bar color
    backgroundColor?: string; // background circle color
    textColor?: string; // percentage text color
    showPercentage?: boolean; // whether to show percentage text
  }
  
  export const CircularProgressBar2: React.FC<CircularProgressBar2Props> = ({
    progress,
    size = 120,
    thickness = 8,
    color = '#3b82f6', // blue-500
    backgroundColor = '#e5e7eb', // gray-200
    textColor = '#374151', // gray-700
    showPercentage = true
  }) => {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);
    
    // Calculate the radius (account for stroke width)
    const radius = (size - thickness) / 2;
    
    // Calculate the circumference
    const circumference = 2 * Math.PI * radius;
    
    // Calculate the stroke dash offset based on progress
    const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
    
    // Center coordinates
    const center = size / 2;
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={thickness}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage text */}
        {showPercentage && (
          <div
            className="absolute inset-0 flex items-center justify-center font-semibold"
            style={{ 
              color: textColor,
              fontSize: `${size * 0.15}px` // Dynamic font size based on circle size
            }}
          >
            <Typography.Title level={4}>{Math.round(normalizedProgress)}%</Typography.Title> 
          </div>
        )}
      </div>
    );
  };