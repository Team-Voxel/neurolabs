import React from 'react';

const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = React.useState({ px: 0, py: 0 });

  React.useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ px: ev.clientX, py: ev.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};

export default useMousePosition;