import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
}

interface VerticalStepperProps {
  steps: Step[];
  activeStep?: string;
  onStepChange?: (stepId: string) => void;
  className?: string;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<string>(activeStep || steps[0]?.id || '');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStep) {
      setCurrentStep(activeStep);
    }
  }, [activeStep]);

  const handleStepClick = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step?.disabled) return;

    setCurrentStep(stepId);
    onStepChange?.(stepId);

    // Smooth scroll to content
    if (contentRef.current) {
      contentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const getStepIndex = (stepId: string) => {
    return steps.findIndex(step => step.id === stepId);
  };

  const isStepActive = (stepId: string) => stepId === currentStep;
  const isStepCompleted = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    return step?.completed || false;
  };

  const currentStepContent = steps.find(step => step.id === currentStep)?.content;

  return (
    <div className={`flex gap-8 ${className}`}>
      {/* Left-aligned Stepper */}
      <div className="flex-shrink-0 w-80">
        <div className="relative">
          {steps.map((step, index) => {
            const isActive = isStepActive(step.id);
            const isCompleted = isStepCompleted(step.id);
            const isDisabled = step.disabled;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 transition-colors duration-300" />
                )}

                {/* Step Item */}
                <div
                  className={`
                    relative flex items-start gap-4 p-4 rounded-xl cursor-pointer
                    transition-all duration-300 ease-in-out transform group
                    ${isActive 
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-lg scale-105 ring-4 ring-blue-200 ring-opacity-50' 
                      : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300 hover:scale-102'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'}
                  `}
                  onClick={() => handleStepClick(step.id)}
                >
                  {/* Step Number/Icon */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? 'bg-blue-500 text-white scale-110' 
                      : isCompleted 
                        ? 'bg-green-500 text-white group-hover:scale-105'
                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300 group-hover:scale-105'
                    }
                  `}>
                    {isCompleted ? (
                      <Check size={20} className="animate-pulse" />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold text-lg transition-colors duration-300
                      ${isActive 
                        ? 'text-blue-700' 
                        : 'text-gray-800 group-hover:text-gray-900'
                      }
                    `}>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className={`
                        text-sm mt-1 transition-colors duration-300
                        ${isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-600 group-hover:text-gray-700'
                        }
                      `}>
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className={`
                    transition-all duration-300 transform
                    ${isActive 
                      ? 'text-blue-500 scale-110' 
                      : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'
                    }
                  `}>
                    <ChevronRight size={20} />
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className={`
                    absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-100' 
                      : 'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'
                    }
                  `}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right-side Content */}
      <div className="flex-1 min-w-0">
        <div
          ref={contentRef}
          className="bg-white rounded-xl border-2 border-gray-200 shadow-md p-8 min-h-96 transition-all duration-300"
        >
          {currentStepContent || (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a step to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};