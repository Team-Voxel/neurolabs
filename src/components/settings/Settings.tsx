import React from 'react';
import { SettingsProps } from './types';
import SettingControl from './SettingsControl';

const Settings: React.FC<SettingsProps> = ({ controls, className = '' }) => {
  return (
    <div className='flex w-full h-full justify-center items-center'>
      <div className='flex flex-col text-gray-800 w-full h-full overflow-y-auto overflow-x-hidden'>
        <div>
          {controls.map((control) => (
            control.visible && <SettingControl key={control.id} control={control} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;