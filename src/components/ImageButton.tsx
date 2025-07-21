import React from "react";

export interface ImageButtonProps {
  imagePath: string;       // Local image path (e.g. "./assets/my-icon.png")
  label: string;
  onClick: () => void;
  className?: string;
  imageAlt?: string;
}

const ImageButton: React.FC<ImageButtonProps> = ({
  imagePath,
  label,
  onClick,
  className = "",
  imageAlt = "icon",
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-20 h-24 rounded-md flex flex-col items-center justify-center p-2 hover:bg-gray-200 transition duration-150 ${className}`}
    >
      <img src={imagePath} alt={imageAlt} className="w-10 h-10 object-contain mb-1" />
      <span className="text-xs text-gray-700 text-center">{label}</span>
    </button>
  );
};

export default ImageButton;