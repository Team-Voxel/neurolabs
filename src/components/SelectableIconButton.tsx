import React from "react";
import { Tooltip } from "antd";
import { twMerge } from "tailwind-merge";

export interface SelectableIconButtonProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SelectableIconButton: React.FC<SelectableIconButtonProps> = ({
  icon,
  label,
  selected = false,
  onClick,
  className = "",
}) => {
  return (
    <Tooltip title={label} placement='bottom'>
      <div
        onClick={onClick}
        className={twMerge(
          "w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-150",
          selected
            ? "bg-gray-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          "outline-none focus:ring-0 focus:outline-none", // Removes focus visuals
          className
        )}
      >
        {icon}
      </div>
    </Tooltip>
  );
};

export default SelectableIconButton;