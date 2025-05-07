import React, { useState } from 'react';
import MenuButton from './MenuButton';
import MainMenuTitle from './MainMenuTitle';
import { useNavigate } from 'react-router-dom';

const MainMenu: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const menuOptions = [
    { label: 'Sandbox', onClick: () => navigate('/sandbox') },
    { label: 'Explore', onClick: () => console.log('Explore clicked') },
    { label: 'Settings', onClick: () => console.log('Settings clicked') },
    { label: 'Exit', onClick: () => console.log('Exit clicked') },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-40 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
        <MainMenuTitle title="NeuroLabs" />
        
        <div className="space-y-4">
          {menuOptions.map((option, index) => (
            <div 
              key={option.label}
              className="transform transition-all duration-300 ease-in-out"
              style={{ 
                transform: `translateY(${activeIndex === index ? '-5px' : '0'})`,
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <MenuButton 
                label={option.label} 
                onClick={option.onClick}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MainMenu;