import React from 'react';
import { Typography } from 'antd';

interface MainMenuTitleProps {
  title: string;
}

const MainMenuTitle: React.FC<MainMenuTitleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center mb-8 select-none">
      <div className="relative">
        <Typography.Title level={1} style={{marginBottom: 2}}>
          {title}
        </Typography.Title>
      </div>
      {/* underline design */}
      <div className="mt-0 h-1 w-40 bg-gradient-to-r from-gray-700 to-gray-800 flex rounded-full"></div>
    </div>
  );
};

export default MainMenuTitle;