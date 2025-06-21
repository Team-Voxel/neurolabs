import React from 'react';
import { Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { SettingControl as SettingControlType } from './types';
import {SliderControl, SwitchControl, SelectControl, NumberControl, ListControl, CheckboxControl} from './Controls';

interface SettingControlProps {
  control: SettingControlType;
}

const SettingControl: React.FC<SettingControlProps> = ({ control }) => {
  const { id, label, type, tooltip } = control;

  const renderControl = () => {
    switch (type) {
      case 'slider':
        return <SliderControl control={control} />;
      case 'switch':
        return <SwitchControl control={control} />;
      case 'select':
        return <SelectControl control={control} />;
      case 'number':
        return <NumberControl control={control} />;
      case 'list':
        return <ListControl control={control} />;
      case 'checkbox':
        return <CheckboxControl control={control} />;
      default:
        return null;
    }
  };

  return (
    <div 
      key={id} 
      className="flex flex-col items-center justify-between p-3 border-b border-gray-200 last:border-0"
    >
      <div className="flex flex-row items-center justify-start w-full mb-1">
        <Typography.Text className="font-medium text-gray-800">{label}</Typography.Text>
        {tooltip && (
          <Tooltip title={tooltip} placement="top">
            <InfoCircleOutlined className="ml-2 text-gray-400 hover:text-gray-600 transition-colors" />
          </Tooltip>
        )}
      </div>
      <div className="w-full">
      {renderControl()}
      </div>
    </div>
  );
};

export default SettingControl;