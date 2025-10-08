import React, { useEffect, useState } from 'react';
import { Button, InputNumber, Select, Slider, Space, Switch, Checkbox, Input, Typography} from 'antd';
import { 
  NumberSettingControl, 
  SelectSettingControl, 
  SliderSettingControl, 
  SwitchSettingControl, 
  ListSettingControl,
  CheckboxSettingControl,
  StringSettingControl
} from './types';
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
        <Select
            value={value}
            onChange={onChange}
            className="w-full settings-select"
            options={options}
            size="middle"
        />
    );
};
  
interface SliderControlProps {
    control: SliderSettingControl;
  }
  
export const SliderControl: React.FC<SliderControlProps> = ({ control }) => {
    const { isLogarithmic = false, value = 0, min, max, step, onChange } = control;
    
    const base = 20;
    const transform = (value: number) => {
      if (isLogarithmic) {
        const t = (value - min) / (max - min);
        return min + (max - min) * ((Math.pow(base, t) - 1) / (base - 1));
      }
      return value;
    }

    return (
        isLogarithmic ? <Slider
            value={transform(value)}
            min={min}
            max={max}
            onChange={onChange}
            className="settings-slider"
            marks={{ [min]: `${min}`, [max]: `${max}` }}
        /> : 
        <Slider
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            className="settings-slider"
            marks={{ [min]: `${min}`, [max]: `${max}` }}
        />
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
    const updatedNumbers = [...numbers, 16]; // Default value for new input
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
              placeholder="Enter neuron count"
            />
            <Button 
              danger 
              type="text" 
              onClick={() => handleRemoveNumber(index)}
              aria-label="Remove layer"
            >
              <Typography.Title level={5}>Remove</Typography.Title>
            </Button>
          </Space>
        ))}
        <Button 
          type="dashed" 
          onClick={handleAddNumber} 
          style={styles.addButton}
          icon={<PlusOutlined />}
        >
          <Typography.Title level={5}>Add New Layer</Typography.Title>
        </Button>
      </Space>
    );
}

export interface CheckboxControlProps {
  control: CheckboxSettingControl;
}

export const CheckboxControl: React.FC<CheckboxControlProps> = ({ control }) => {
  const { value, onChange, controlType } = control;

  return (
    controlType === 'checkbox' ? (
      <Checkbox
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="settings-checkbox"
      />
    ) :
    <Switch
      checked={value}
      onChange={onChange}
      size="default"
      className="settings-checkbox"
    />
  );
};

export interface StringControlProps {
  control: StringSettingControl;
}

export const StringControl: React.FC<StringControlProps> = ({ control }) => {
  const { value, onChange, id, label, placeholder } = control;

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="settings-string"
      placeholder={placeholder}
      id={id}
      aria-label={label}
    />
  );
};