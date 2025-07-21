import React, { useState } from 'react';

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  displayValue: string | number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  min, 
  max, 
  value, 
  displayValue, 
  onChange 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Label and Value Display */}
      <div className="flex justify-between items-center mb-4">
        <label 
          htmlFor={`slider-${label}`}
          className="text-lg font-semibold text-gray-800"
        >
          {label}
        </label>
        <div className="bg-lime-300 px-3 py-1 rounded-full text-sm font-bold text-gray-800 min-w-[60px] text-center">
          {displayValue}
        </div>
      </div>

      {/* Slider Container */}
      <div 
        className="relative h-6 flex items-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Active Track */}
          <div 
            className="h-full bg-orange-300 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Hover Track Effect */}
        {isHovered && (
          <div 
            className="absolute h-2 bg-yellow-200 rounded-full transition-all duration-200 ease-out opacity-50"
            style={{ width: `${percentage}%` }}
          />
        )}

        {/* Slider Input */}
        <input
          id={`slider-${label}`}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
          style={{ margin: 0 }}
        />

        {/* Custom Thumb */}
        <div
          className={`absolute w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-200 ease-out transform -translate-x-1/2 z-20 ${
            isDragging 
              ? 'bg-red-500 scale-110 shadow-xl' 
              : isHovered 
                ? 'bg-red-400 scale-105 shadow-lg' 
                : 'bg-red-400 scale-100'
          }`}
          style={{
            left: `${percentage}%`,
            top: '50%',
            transform: `translateX(-50%) translateY(-50%) scale(${isDragging ? 1.1 : isHovered ? 1.05 : 1})`
          }}
        />

        {/* Thumb Glow Effect */}
        {(isHovered || isDragging) && (
          <div
            className="absolute w-8 h-8 bg-red-400 rounded-full opacity-20 transition-all duration-200 ease-out transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${percentage}%`,
              top: '50%'
            }}
          />
        )}
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};