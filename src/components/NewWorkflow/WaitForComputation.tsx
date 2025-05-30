import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAutoEDA, requestDimRedux } from '../../backend_api/data_api';
import { Spin, Typography } from 'antd';
import { useWorkflowStore } from '../../AppState';
import { create } from 'zustand';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import { ThreeCircles } from "react-loader-spinner";

export interface WaitForComputationStore {
    wfDir: string;
    problemType: string;
    target: string;
    dataPath: string;
    setAll: (wfDir: string, problemType: string, target: string, dataPath: string) => void;
}

export const useWaitForComputationStore = create<WaitForComputationStore>((set) => ({
    wfDir: '',
    problemType: '',
    target: '',
    dataPath: '',
    setAll: (wfDir: string, problemType: string, target: string, dataPath: string) => set({ wfDir, problemType, target, dataPath }),
}));

// This component is used to wait until the data analysis computations are finished
// It will display a loading screen until the computations are finished
// It will then navigate to the sandbox page
// Loading screen will have an animated background and section in the middle with a spinner and a animating message
// Message will change state from "Analyzing Data" to "Generating Visualizations" to "Computing Relationships" to 
// "Computing Distributions" to "Thinking..." and will wait until the computations are finished

const messages = [
    "Analyzing Data...", 
    "Generating Visualizations...", 
    "Computing Relationships...", 
    "Computing Distributions...", 
    "Looking at your numbers...",
    "Finding patterns in the data...",
    "Making sense of the information...",
    "Building our understanding...",
    "Connecting the dots...",
    "Discovering hidden connections...",
    "Thinking...",
];

const finalizingMessages = [
    "Just a moment longer!",
    "Almost there!",
    "Hold on tight!",
    "We're almost done!",
];

const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
    const [displayText, setDisplayText] = useState<string>(text);
    const [isTyping, setIsTyping] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        setIsVisible(false);
        const hideTimeout = setTimeout(() => {
            setIsTyping(true);
            setDisplayText("");
            setIsVisible(true);
            let currentIndex = 0;
            
            const typingInterval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayText((prev) => text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                }
            }, 50);

            return () => clearInterval(typingInterval);
        }, 100);

        return () => clearTimeout(hideTimeout);
    }, [text]);

    return (
        <div className={`
            transition-all duration-300 ease-in-out
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        `}>
            <Typography.Title level={2} className="relative" style={{ color: '#eeeeee', textShadow: '0 0 10px #000' }}>
                <span className="relative">
                    {displayText}
                    {isTyping && (
                        <span className="absolute right-[-1ch] animate-blink">|</span>
                    )}
                </span>
            </Typography.Title>
        </div>
    );
};

const WaitForComputation : React.FC = () => {
    const navigate = useNavigate();
    const [completed, setCompleted] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<number>(0);
    const [finalizing, setFinalizing] = useState<boolean>(false);

     // Initialize tsParticles
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        console.log("Particles loaded", container);
    }, []);

    // Use the hook to subscribe to state changes
    const { wfDir, problemType, target, dataPath } = useWaitForComputationStore();

    useEffect(() => {
        const interval = setInterval(() => {
            const nMsg = finalizing ? Math.floor(Math.random() * finalizingMessages.length) : Math.floor(Math.random() * messages.length);
            setCurrentMessage(nMsg);
        }, 3000);

        return () => clearInterval(interval);
    }, [finalizing]);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            if (completed) {
                navigate('/sandbox');
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [completed, navigate]);

    useEffect(() => {
        if (!wfDir || !problemType || !target || !dataPath) {
            console.log('Missing required configuration:', { wfDir, problemType, target, dataPath });
            return;
        }

        const config = {
            wfDir: wfDir,
            data_path: dataPath,
            problem_type: problemType,
            target: target,
            n_samples: 1000,
            random_state: 43,
            n_components: 2,
            n_clusters: 3,
            method: 'umap',
        }

        console.log('Starting computation with config:', config);
        
        requestDimRedux(config).then((result) => {
            console.log('DimRedux completed:', result['success']);
            setFinalizing(true);
            requestAutoEDA(config).then((result) => {
                console.log('AutoEDA completed:', result['success']);
                setCompleted(true);
            });
        });
    }, [wfDir, problemType, target, dataPath]);

    const messageToShow = finalizing 
        ? finalizingMessages[currentMessage] 
        : messages[currentMessage];

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
            <div className="relative z-10"> {/* Add z-index to ensure content is above particles */}
                {completed ? (
                    <div className='flex flex-col items-center justify-center h-full w-full gap-8'>
                        <Typography.Title level={2}>Computations Completed!</Typography.Title>
                        <Typography.Title level={3}>Navigating to Sandbox...</Typography.Title>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-full w-full gap-8'>
                        {/* // Spinner with a color that contrasts with "#1f2937" */}
                        <ThreeCircles
                            visible={true}
                            height="100"
                            width="100"
                            color="#A7F3D0"
                            ariaLabel="three-circles-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        <AnimatedText 
                            text={messageToShow}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default WaitForComputation;