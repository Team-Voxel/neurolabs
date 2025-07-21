import React from 'react';
import { SettingsProps } from './types';
import SettingControl from './SettingsControl';

const Settings: React.FC<SettingsProps> = ({ controls, className = '' }) => {
  const visibleControls = controls.filter(control => control.visible || control.visible === undefined);
  return (
    <div className={`flex w-full h-full justify-center items-center`}>
      <div className='flex flex-col text-gray-800 w-full h-full overflow-y-auto overflow-x-hidden'>
        <div className={`${className}`}>
          {visibleControls.map((control) => (
            <SettingControl key={control.id} control={control} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;