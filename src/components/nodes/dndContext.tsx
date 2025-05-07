import React, { createContext, useContext, useState, ReactNode } from 'react';

type DnDType = string | null;
type SetDnDType = React.Dispatch<React.SetStateAction<DnDType>>;

const DnDContext = createContext<[DnDType, SetDnDType] | undefined>(undefined);

export const DnDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [type, setType] = useState<DnDType>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = () => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
};