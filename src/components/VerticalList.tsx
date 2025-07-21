import React, { useCallback, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface SelectionOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface VerticalSelectorProps {
  options: SelectionOption[];
  selectedValue?: string;
  onChange: (value: string, option: SelectionOption) => void;
  className?: string;
  placeholder?: string;
  allowDeselect?: boolean;
}

export const VerticalSelector: React.FC<VerticalSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  className = '',
  placeholder = 'Select an option',
  allowDeselect = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view on mount
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedValue]);

  const handleSelection = useCallback(
    (option: SelectionOption) => {
      if (option.disabled) return;
      
      if (allowDeselect && selectedValue === option.value) {
        onChange('', option);
      } else {
        onChange(option.value, option);
      }
    },
    [selectedValue, onChange, allowDeselect]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, option: SelectionOption) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelection(option);
      }
    },
    [handleSelection]
  );

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-md mx-auto ${className}`}
      role="radiogroup"
      aria-label="Selection options"
    >
      {!selectedValue && placeholder && (
        <div className="text-gray-500 text-sm font-medium mb-3 px-1">
          {placeholder}
        </div>
      )}
      
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isDisabled = option.disabled;

          return (
            <div
              key={option.id}
              ref={isSelected ? selectedRef : undefined}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
              className={`
                group relative w-full text-left px-5 py-4 rounded-xl
                transition-all duration-200 ease-out
                transform hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                min-h-[2.5rem] sm:min-h-[4rem]
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
                ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:border-gray-200 hover:shadow-none'
                    : 'cursor-pointer'
                }
              `}
              onClick={() => handleSelection(option)}
              onKeyDown={(e) => handleKeyDown(e, option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div
                    className={`
                      font-medium text-base sm:text-lg transition-colors duration-200
                      ${
                        isSelected
                          ? 'text-blue-900'
                          : isDisabled
                          ? 'text-gray-400'
                          : 'text-gray-900 group-hover:text-gray-700'
                      }
                    `}
                  >
                    {option.label}
                  </div>
                  {option.description && (
                    <div
                      className={`
                        text-sm mt-1 transition-colors duration-200
                        ${
                          isSelected
                            ? 'text-blue-700'
                            : isDisabled
                            ? 'text-gray-300'
                            : 'text-gray-500 group-hover:text-gray-600'
                        }
                      `}
                    >
                      {option.description}
                    </div>
                  )}
                </div>
                
                <div
                  className={`
                    ml-4 flex-shrink-0 transition-all duration-200
                    ${
                      isSelected
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-75'
                    }
                  `}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Subtle gradient overlay on hover */}
              <div
                className={`
                  absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200
                  bg-gradient-to-r from-gray-50 to-gray-100
                  ${!isSelected && !isDisabled ? 'group-hover:opacity-30' : ''}
                `}
              />

              {/* Selected item indicator */}
              {isSelected && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalSelector;