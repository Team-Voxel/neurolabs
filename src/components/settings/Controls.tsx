import React, { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Slider, Space, Switch } from 'antd';
import { NumberSettingControl, SelectSettingControl, SliderSettingControl, SwitchSettingControl, ListSettingControl} from './types';
import { CSSProperties } from 'react';
import { PlusOutlined } from '@ant-design/icons';

export const styles: Record<string, CSSProperties> = {
  container: {
    width: '100%',
  },
  inputRow: {
    width: '100%',
    alignItems: 'center',
    // Add a subtle animation for changes
    transition: 'all 0.2s ease-in-out',
  },
  inputNumber: {
    minWidth: 120,
    flex: 1,
  },
  addButton: {
    width: '100%',
    marginTop: 8,
  },
  tooltipIcon: {
    marginLeft: 8,
    color: '#999',
    cursor: 'help',
  },
};

interface NumberControlProps {
  control: NumberSettingControl;
}

export const NumberControl: React.FC<NumberControlProps> = ({ control }) => {
  const { value, min, max, step, onChange } = control;
  
  return (
    <InputNumber
      value={value}
      min={min}
      max={max}
      step={step || 1}
      onChange={onChange}
      className="settings-number"
      size="middle"
    />
  );
};

interface SelectControlProps {
    control: SelectSettingControl;
  }
  
export const SelectControl: React.FC<SelectControlProps> = ({ control }) => {
    const { value, options, onChange } = control;

    return (
        <div className="w-48">
        <Select
            value={value}
            onChange={onChange}
            className="w-full settings-select"
            options={options}
            size="middle"
        />
        </div>
    );
};
  
interface SliderControlProps {
    control: SliderSettingControl;
  }
  
export const SliderControl: React.FC<SliderControlProps> = ({ control }) => {
    const { value, min, max, step, onChange } = control;

    return (
        <div className="w-32 sm:w-40 md:w-48">
        <Slider
            value={value}
            min={min}
            max={max}
            step={step || 1}
            onChange={onChange}
            className="settings-slider"
        />
        </div>
    );
};
  

interface SwitchControlProps {
    control: SwitchSettingControl;
}
  
export const SwitchControl: React.FC<SwitchControlProps> = ({ control }) => {
    const { value, onChange } = control;
    
    return (
      <Switch
        checked={value}
        onChange={onChange}
        size="default"
        className="settings-switch"
      />
    );
};

interface ListControlProps {
    control: ListSettingControl;
}

export const ListControl: React.FC<ListControlProps> = ({ control }) => {
  const { value, onChange } = control;

  const [numbers, setNumbers] = useState<(number | null)[]>(value);

  // Update internal state when external value changes
  useEffect(() => {
    setNumbers(value);
  }, [value]);

  // Handle changes to a specific number input
  const handleNumberChange = (index: number, newValue: number | null) => {
    const updatedNumbers = [...numbers];
    updatedNumbers[index] = newValue;
    
    // Filter out null values before calling onChange
    const filteredNumbers = updatedNumbers.filter((num): num is number => 
      num !== null && !isNaN(num)
    );
    
    setNumbers(updatedNumbers);
    onChange(filteredNumbers);
  };

  // Add a new number input to the list
  const handleAddNumber = () => {
    const updatedNumbers = [...numbers, null];
    setNumbers(updatedNumbers);
    
    // Don't call onChange here since the new value is null
    // It will be called when the user enters a value
  };

  // Remove a number input from the list
  const handleRemoveNumber = (index: number) => {
    const updatedNumbers = [...numbers];
    updatedNumbers.splice(index, 1);
    
    // Filter out null values before calling onChange
    const filteredNumbers = updatedNumbers.filter((num): num is number => 
      num !== null && !isNaN(num)
    );
    
    setNumbers(updatedNumbers);
    onChange(filteredNumbers);
  };

    // Show a list of number inputs and a button to add a new input
    return (
        <Space direction="vertical" style={styles.container}>
        {numbers.map((number, index) => (
          <Space key={`number-${index}`} style={styles.inputRow}>
            <InputNumber
              value={number}
              onChange={(value) => handleNumberChange(index, value)}
              style={styles.inputNumber}
              placeholder="Enter a number"
            />
            <Button 
              danger 
              type="text" 
              onClick={() => handleRemoveNumber(index)}
              aria-label="Remove number"
            >
              Remove
            </Button>
          </Space>
        ))}
        <Button 
          type="dashed" 
          onClick={handleAddNumber} 
          style={styles.addButton}
          icon={<PlusOutlined />}
        >
          Add Number
        </Button>
      </Space>
    );
}
