import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button, Typography } from 'antd';

export interface Step {
  id: string;
  title: string;
  content: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}

export enum StepStatus {
  COMPLETED = 'completed',
  CURRENT = 'current',
  UPCOMING = 'upcoming'
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepChange }) => {
  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return StepStatus.COMPLETED;
    if (index === currentStep) return StepStatus.CURRENT;
    return StepStatus.UPCOMING;
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const getStepButtonClasses = (status: StepStatus) => {
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ease-in-out';
    
    switch (status) {
      case StepStatus.COMPLETED:
        return `${baseClasses} bg-emerald-500 border-emerald-500 text-white shadow-lg`;
      case StepStatus.CURRENT:
        return `${baseClasses} bg-blue-500 border-blue-500 text-white shadow-lg ring-4 ring-blue-200`;
      case StepStatus.UPCOMING:
        return `${baseClasses} bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:border-gray-400`;
      default:
        return baseClasses;
    }
  };

  const getStepTitleClasses = (status: StepStatus) => {
    const baseClasses = 'text-sm font-medium transition-colors duration-300';
    
    switch (status) {
      case StepStatus.COMPLETED:
        return `${baseClasses} text-emerald-600`;
      case StepStatus.CURRENT:
        return `${baseClasses} text-blue-600`;
      case StepStatus.UPCOMING:
        return `${baseClasses} text-gray-500`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (index: number) => {
    const isCompleted = index < currentStep;
    return `h-0.5 w-10 transition-colors duration-300 ${
      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
    }`;
  };

  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [maxWidth, setMaxWidth] = useState(0);

  useEffect(() => {
    const widths = titleRefs.current.map((el) => el?.offsetWidth || 0);
    setMaxWidth(Math.max(...widths));
  }, [steps]);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6">
      {/* Stepper Navigation */}
      <div className="relative mb-8">
        {/* Step Indicators */}
        <div className="flex w-full items-center justify-center mx-auto">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center" style={{ minWidth: maxWidth + 16 }}>
                  {/* Step div */}
                  <div
                  style={{userSelect: 'none'}}
                    onClick={() => onStepChange(index)}
                    className={`${getStepButtonClasses(status)} mb-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                  >
                    {status === StepStatus.COMPLETED ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold"><Typography.Text>{index + 1}</Typography.Text></span>
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <div className={getStepTitleClasses(status)} style={{userSelect: 'none'}}>
                    <Typography.Text  ref={(el) => (titleRefs.current[index] = el)}>{step.title}</Typography.Text>
                  </div>
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className="flex items-center mb-[40px] mx-2">
                    <div className={getConnectorClasses(index)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex w-full h-full relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="w-full flex-shrink-0 px-2"
              aria-hidden={index !== currentStep}
            >
              <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-0  h-full w-full min-h-[400px]">
                <div className="flex-1 w-full flex min-h-full py-4">
                  {step.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      {/* <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Stepper;