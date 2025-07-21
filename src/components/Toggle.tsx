import React from 'react';

interface ToggleProps {
  option1: string;
  option2: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  option1,
  option2,
  defaultValue,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isOption1, setIsOption1] = React.useState(defaultValue);

  const handleToggle = () => {
    if (!disabled) {
      const newValue = !isOption1;
      setIsOption1(newValue);
      onChange(newValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="switch"
      aria-checked={isOption1}
      tabIndex={disabled ? -1 : 0}
      className={`
        inline-flex items-center p-1 rounded-lg
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 cursor-pointer hover:bg-gray-300'}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex items-center">
        <span
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
            ${isOption1
              ? 'bg-indigo-500 text-white'
              : 'bg-transparent text-gray-600'
            }
            ${disabled ? 'opacity-50' : 'hover:bg-indigo-600'}
          `}
        >
          {option1}
        </span>
        <span
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
            ${!isOption1
              ? 'bg-indigo-500 text-white'
              : 'bg-transparent text-gray-600'
            }
            ${disabled ? 'opacity-50' : 'hover:bg-indigo-600'}
          `}
        >
          {option2}
        </span>
      </div>
    </div>
  );
};

export default Toggle;