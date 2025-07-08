import React, { useState } from 'react';
import { ArrowBigLeft, Check, History } from 'lucide-react';
import { Button, Tooltip, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export interface StepperStep {
  id: number;
  title: string;
  description?: string;
  content: React.ReactNode;
  isCompleted?: boolean;
  isDisabled?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep = 0,
  onStepChange,
  className = ''
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const navigate = useNavigate();
  const handleStepClick = (stepIndex: number) => {
    if (steps[stepIndex].isDisabled) return;
    
    setActiveStep(stepIndex);
    onStepChange?.(stepIndex);
  };

  const getStepStatus = (stepIndex: number) => {
    if (steps[stepIndex].isCompleted) return 'completed';
    if (stepIndex === activeStep) return 'active';
    if (stepIndex < activeStep) return 'completed';
    return 'inactive';
  };

  return (
    <div className={`flex min-h-screen bg-gray-50 ${className}`}>
      {/* Stepper Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className='flex flex-row justify-space gap-8 mb-4'>
                <Tooltip title="Go Back" placement="bottom">
                <div
                onClick={()=>navigate('/sandbox/?tab=1')}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700
                            transition-all duration-200 hover:scale-110 transform"
                >
                <ArrowBigLeft size={32} />
                </div>
                </Tooltip>
                <Tooltip title="History" placement="bottom">
                <div
                onClick={()=>setActiveStep(-1)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700
                            transition-all duration-200 hover:scale-110 transform"
                >
                <History size={32} />
                </div>
                </Tooltip>
            </div>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isActive = step.id === activeStep;
            const isCompleted = status === 'completed';
            const isDisabled = step.isDisabled;

            if (step.id != -1){
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200">
                    <div 
                      className={`w-full transition-all duration-500 ${
                        isCompleted || step.id < activeStep 
                          ? 'bg-gradient-to-b from-blue-500 to-purple-500 h-full' 
                          : 'bg-gray-200 h-0'
                      }`}
                    />
                  </div>
                )}

                {/* Step Item */}
                <div
                  className={`
                    relative flex items-start gap-4 p-4 rounded-xl cursor-pointer 
                    transition-all duration-300 ease-in-out transform group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 shadow-lg scale-105 ring-4 ring-blue-200 ring-opacity-50' 
                      : isCompleted
                        ? 'bg-green-50 border-2 border-green-200 shadow-md hover:shadow-xl hover:scale-102'
                        : isDisabled
                          ? 'bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300 hover:scale-102'
                    }
                    ${!isDisabled && 'hover:shadow-2xl'}
                  `}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Step Number/Icon */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full 
                    transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110' 
                      : isCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : isDisabled
                          ? 'bg-gray-300 text-gray-500'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:scale-105'
                    }
                  `}>
                    {isCompleted ? (
                      <Check size={20} className="animate-pulse" />
                    ) : (
                      <span className="font-semibold text-sm">
                        <Typography.Text>{index + 1}</Typography.Text>
                      </span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold text-lg transition-colors duration-300
                      ${isActive 
                        ? 'text-blue-700' 
                        : isCompleted
                          ? 'text-green-700'
                          : isDisabled
                            ? 'text-gray-400'
                            : 'text-gray-800 group-hover:text-gray-900'
                      }
                    `}>
                      <Typography.Title level={5} >{step.title}</Typography.Title> 
                    </h3>
                    {step.description && (
                      <p className={`
                        text-sm mt-1 transition-colors duration-300
                        ${isActive 
                          ? 'text-blue-600' 
                          : isCompleted
                            ? 'text-green-600'
                            : isDisabled
                              ? 'text-gray-400'
                              : 'text-gray-600 group-hover:text-gray-700'
                        }
                      `}>
                        <Typography.Text>{step.description}</Typography.Text>
                      </p>
                    )}
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
                      : isCompleted
                        ? 'bg-gradient-to-r from-green-400/10 to-blue-400/10 group-hover:opacity-100'
                        : !isDisabled && 'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'
                    }
                  `}></div>
                </div>
              </div>
            );
            }
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full p-8">
          {/* Content with smooth transitions */}
          <div className="relative h-full">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  absolute inset-0 transition-all duration-500 ease-in-out
                  ${step.id === activeStep 
                    ? 'opacity-100 transform translate-y-0' 
                    : step.id < activeStep
                      ? 'opacity-0 transform -translate-y-8'
                      : 'opacity-0 transform translate-y-8'
                  }
                `}
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full p-6 overflow-y-auto">
                    {step.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;