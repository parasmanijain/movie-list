import { useLayoutEffect, useState, useCallback } from 'react';

export const useWindowDimensions = (): [number, number] => {
  const [size, setSize] = useState<[number, number]>([
    window.innerWidth,
    window.innerHeight
  ]);

  const updateSize = useCallback(() => {
    setSize([window.innerWidth, window.innerHeight]);
  }, []);

  useLayoutEffect(() => {
    // Debounce resize events to avoid excessive re-renders
    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSize);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    updateSize();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [updateSize]);

  return size;
};
