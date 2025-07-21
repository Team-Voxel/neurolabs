export type ControlType = 'slider' | 'switch' | 'select' | 'number' | 'list' | 'checkbox' | 'string';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BaseSettingControl {
  id: string;
  label: string;
  type: ControlType;
  tooltip?: string;
  onChange: (value: any) => void;
  visible?: boolean;
}

export interface SliderSettingControl extends BaseSettingControl {
  type: 'slider';
  isLogarithmic?: boolean;
  value: number;
  min: number;
  max: number;
  step?: number;
}

export interface SwitchSettingControl extends BaseSettingControl {
  type: 'switch';
  value: boolean;
}

export interface SelectSettingControl extends BaseSettingControl {
  type: 'select';
  value: string | number;
  options: SelectOption[];
}

export interface NumberSettingControl extends BaseSettingControl {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface ListSettingControl extends BaseSettingControl {
  type: 'list';
  value: number[];
  onChange: (value: number[]) => void;
}

export interface CheckboxSettingControl extends BaseSettingControl {
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
  controlType: 'checkbox' | 'switch';
}

export interface StringSettingControl extends BaseSettingControl {
  type: 'string';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export type SettingControl =
  | SliderSettingControl
  | SwitchSettingControl
  | SelectSettingControl
  | NumberSettingControl
  | ListSettingControl
  | CheckboxSettingControl
  | StringSettingControl;

export interface SettingsProps {
  controls: SettingControl[];
  className?: string;
}