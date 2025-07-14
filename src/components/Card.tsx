import React from 'react';
import { FolderOpen, Trash2, BarChart3, PieChart } from 'lucide-react';
import { Typography } from 'antd';

// Problem type icons/images
const problemTypeIcons = {
  regress: (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
      <BarChart3 size={64} className="text-blue-600" />
    </div>
  ),
  classify: (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
      <PieChart size={64} className="text-green-600" />
    </div>
  ),
};

interface CardProps {
  label: string;
  problemType: 'regress' | 'classify';
  onOpen: (label: string) => void;
  onDelete: (label: string) => void;
}

export const Card: React.FC<CardProps> = ({
  label,
  problemType,
  onOpen,
  onDelete
}) => {
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(label);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(label);
  };

  return (
    <div className={`
      relative flex flex-col rounded-xl overflow-hidden
      min-h-54 min-w-64 flex-1
      transition-all duration-300 ease-in-out transform
      bg-white border-2 border-gray-200 shadow-md 
      hover:shadow-xl hover:border-gray-300
      hover:shadow-2xl
      group
    `}>
      {/* Top 2/3 - Image/Icon Section */}
      <div className="flex-[2] p-4 transition-transform duration-300 group-hover:scale-105">
        {problemTypeIcons[problemType]}
      </div>

      {/* Bottom 1/3 - Label and Buttons Section */}
      <div className="flex-1 flex flex-col justify-between p-4 pt-2 bg-gray-50 border-t border-gray-100">
        {/* Label */}
        <div className="flex items-center justify-center mb-3">
          <Typography.Title level={4} style={{userSelect: 'none'}}>
            {label}
          </Typography.Title>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <div
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 
                       bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg
                       transition-all duration-200 hover:scale-105 transform
                       font-medium text-sm"
            title="Open Problem"
            style={{userSelect: 'none'}}
          >
            <FolderOpen size={16} />
            <Typography.Text>Open</Typography.Text>
          </div>
          <div
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 
                       bg-red-100 hover:bg-red-200 text-red-700 rounded-lg
                       transition-all duration-200 hover:scale-105 transform
                       font-medium text-sm"
            title="Delete Problem"
            style={{userSelect: 'none'}}
          >
            <Trash2 size={16} />
            <Typography.Text>Delete</Typography.Text>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                      bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100
                      pointer-events-none">
      </div>
    </div>
  );
};