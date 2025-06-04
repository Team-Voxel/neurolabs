import React, { useState, useCallback } from 'react';
import MenuButton from './MenuButton';
import MainMenuTitle from './MainMenuTitle';
import { useNavigate } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

const MainMenu: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const menuOptions = [
    { label: 'Start', onClick: () => navigate('/learn') },
    { label: 'Explore', onClick: () => navigate('/workflow-selection') },
    { label: 'Settings', onClick: () => console.log('Settings clicked') },
    { label: 'Exit', onClick: () => {window.electronAPI.openChildWindow({component: 'WaitForComputation', props: {}}); console.log('Open Component') }},
  ];

  // Initialize tsParticles
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
      
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#1f2937", // Dark background 
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 130,
              enable: true,
              opacity: 0.2,
              width: 0.5,
            },
            collisions: {
              enable: false, // Disable collisions for smoother movement
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
              attract: {
                enable: false, // Default state (will be controlled by mouse)
                rotateX: 600,
                rotateY: 1200
              }
            },
            number: {
              density: {
                enable: true,
                area: 750, 
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle", // Use circles for particles
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "attract", // Key setting: attract particles to mouse
              },
              onClick: {
                enable: true,
                mode: "push", // Add more particles on click
              },
              resize: true,
            },
            modes: {
              attract: {
                distance: 200, // How far particles will be attracted from
                duration: 0.5, // Duration of the effect
                factor: 5, // Strength of attraction
                maxSpeed: 40, // Maximum speed particles can reach
                speed: 1, // Movement speed
              },
              push: {
                quantity: 4, // How many particles to add on click
              },
              repulse: {
                distance: 200,
                duration: 0.4
              },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      
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