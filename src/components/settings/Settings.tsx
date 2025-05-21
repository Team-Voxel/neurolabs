import React from 'react';
import { SettingsProps } from './types';
import SettingControl from './SettingsControl';

const Settings: React.FC<SettingsProps> = ({ controls, className = '' }) => {
  return (
    <div className="flex-1 w-full overflow-y-auto">
      <div className={`flex flex-col text-gray-800 shadow border rounded-lg p-4 ${className}`}>
        <div className="space-y-1">
          {controls.map((control) => (
            control.visible && <SettingControl key={control.id} control={control} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;