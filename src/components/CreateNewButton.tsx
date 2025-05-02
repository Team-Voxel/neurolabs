import React from 'react';

// Define the props interface
interface ButtonProps {
  icon: string; // Path to the image/icon
  label: string; // Text to display below the icon
  onClick?: () => void; // Optional click handler
}

// Button component with TypeScript
const Button: React.FC<ButtonProps> = ({ icon, label, onClick }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex flex-col text-black size-30 bg-white shadow rounded-xl items-center justify-center text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <img className="size-10 pb-2" src={icon} alt={`${label} icon`} />
      <span>{label}</span>
    </div>
  );
};

export default Button;