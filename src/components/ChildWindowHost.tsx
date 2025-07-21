import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';

export function ChildWindowHost({
  componentMap,
}: {
  componentMap: Record<string, React.FC<any>>;
}) {
  const [init, setInit] = useState<{ component: string; props: any } | null>(
    null
  );
  useEffect(() => {
    window.electronAPI.onChildInit((data) => {
      setInit(data);
    });
  }, []);

  if (!init) {return (
    <div className="flex items-center justify-center h-full">
        <Typography.Title level={5}>Loading...</Typography.Title>;
    </div>
    );
  }
  const { component: key, props } = init;
  const Selected = componentMap[key];
  if (!Selected)
    return <div>Error: no component registered under "{key}"</div>;

  return <Selected {...props} />;
}