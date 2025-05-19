import React from 'react';
import { SettingsProps } from './types';
import SettingControl from './SettingsControl';

const Settings: React.FC<SettingsProps> = ({ controls, className = '' }) => {
  return (
    <div 
      className={`w-1/2 text-gray-800 bg-white shadow border rounded-lg p-4 overflow-y-auto ${className}`}
    >
      <div className="space-y-1">
        {controls.map((control) => (
          control.visible && <SettingControl key={control.id} control={control} />
        ))}
      </div>
    </div>
  );
};

export default Settings;