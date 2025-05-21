import React from 'react';
import { InputNumber, Select, Slider, Switch } from 'antd';
import { NumberSettingControl, SelectSettingControl, SliderSettingControl, SwitchSettingControl} from './types';

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