import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { ImageIcon } from 'lucide-react';
import type { GridItemProps } from './types';

export const GridItem: React.FC<GridItemProps> = ({ 
  item,
  onDragStart,
  onDragEnd,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Tooltip
      content={
        <div>
          <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      }
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow 
          duration-200 hover:shadow-md cursor-grab active:cursor-grabbing"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        draggable
      >
        <div className="relative aspect-square">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`w-full h-full object-cover transition-opacity duration-200
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
        </div>
      </div>
    </Tooltip>
  );
};