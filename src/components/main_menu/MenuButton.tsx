import React from 'react';

interface MenuButtonProps {
  label: string;
  onClick?: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full py-3 px-6 mb-3 text-lg font-medium text-slate-700 bg-white 
                rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-slate-300
                transform transition-all duration-200 ease-in-out
                border border-slate-200"
    >
      {label}
    </div>
  );
};

export default MenuButton;