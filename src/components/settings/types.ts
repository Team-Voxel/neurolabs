export type ControlType = 'slider' | 'switch' | 'select' | 'number';

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

export type SettingControl =
  | SliderSettingControl
  | SwitchSettingControl
  | SelectSettingControl
  | NumberSettingControl;

export interface SettingsProps {
  controls: SettingControl[];
  className?: string;
}