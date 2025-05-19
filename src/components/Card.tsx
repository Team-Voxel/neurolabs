import React, { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';

interface CardImageProps {
  src: string;
  alt: string;
}

const CardImage: React.FC<CardImageProps> = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative w-full h-48 bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export interface CardProps {
    // URL of the image to display on the card
    imageSrc: string;
  
    // Alt text for accessibility
    imageAlt: string;
  
    name: string;
    
    onOpen?: (item : string) => void;
    onDelete?: (item : string) => void;
    className?: string;
}

const Card: React.FC<CardProps> = ({
  imageSrc,
  imageAlt,
  name,
  onOpen,
  onDelete,
  className = '',
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <CardImage src={imageSrc} alt={imageAlt} />
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2 truncate">{name}</h3>
        
        <div className="flex justify-between mt-4 gap-2">
          {onOpen && (
            <div
              onClick={() => onOpen(name)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label={`Open ${name}`}
            >
              <ExternalLink size={16} className="mr-2" />
              Open
            </div>
          )}
          
          {onDelete && (
            <div
              onClick={() => onDelete(name)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              aria-label={`Delete ${name}`}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;