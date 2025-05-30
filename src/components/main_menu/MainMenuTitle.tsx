import React from 'react';

interface MainMenuTitleProps {
  title: string;
}

const MainMenuTitle: React.FC<MainMenuTitleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center mb-8 select-none">
      <div className="relative">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-700 tracking-wide">
          {title}
        </h1>
      </div>
      {/* underline design */}
      <div className="mt-2 h-1 w-40 bg-gradient-to-r from-gray-700 to-gray-800 flex rounded-full"></div>
    </div>
  );
};

export default MainMenuTitle;