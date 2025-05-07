import React, { useState, useEffect, useCallback } from 'react';
import { DynamicFormProps } from './types';
import { LayerControl } from '../nodes/blockLayers';
import { ChevronUp, ChevronDown } from 'lucide-react';

const DynamicForm: React.FC<DynamicFormProps> = ({
  controls,
  onChange,
  className = ''
}) => {
  // Initialize form values from default values
  const [values, setValues] = useState<{ [key: string]: string | number }>(() => {
    const initialValues: { [key: string]: string | number } = {};
    Object.entries(controls).forEach(([key, control]) => {
      initialValues[key] = control.default!;
    });
    return initialValues;
  });

  // Handle value changes
  const handleChange = useCallback((key: string, value: string | number) => {
    setValues(prev => {
      const newValues = { ...prev, [key]: value };
      onChange?.(newValues);
      return newValues;
    });
  }, [onChange]);

  // Handle number increment/decrement
  const handleNumberStep = useCallback((key: string, control: LayerControl, increment: boolean) => {
    if (control.type === 'number') {
      const currentValue = typeof values[key] === 'number' ? values[key] as number : control.default ?? 0;
      const newValue = increment
        ? Math.min(control.max, currentValue + control.step)
        : Math.max(control.min, currentValue - control.step);
      handleChange(key, newValue);
    }
  }, [values, handleChange]);

  // Render individual form control
  const renderControl = (key: string, control: LayerControl) => {
    const baseInputClasses = "w-full p-1 pl-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    
    switch (control.type) {
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={values[key]}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                if (value === '' || (value >= control.min && value <= control.max)) {
                  handleChange(key, value === '' ? control.default ?? 0 : value);
                }
              }}
              min={control.min}
              max={control.max}
              step={control.step}
              className={`${baseInputClasses} pr-8`}
            />
            {/* <div className="absolute right-1 top-1 flex flex-col">
              <button
                type="button"
                onClick={() => handleNumberStep(key, control, true)}
                className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                disabled={values[key] >= control.max}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleNumberStep(key, control, false)}
                className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                disabled={values[key] <= control.min}
              >
                <ChevronDown size={14} />
              </button>
            </div> */}
          </div>
        );

      case 'select':
        return (
          <select
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className={baseInputClasses}
          >
            {control.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'text':
        return (
          <input
            type="text"
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className={baseInputClasses}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={(e) => e.preventDefault()}>
      {Object.entries(controls).map(([key, control]) => (
        <div key={key} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {control.name}
          </label>
          {renderControl(key, control)}
        </div>
      ))}
    </form>
  );
};

export default DynamicForm;