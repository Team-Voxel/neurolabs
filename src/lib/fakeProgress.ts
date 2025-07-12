import { useEffect, useRef, useState } from 'react';

type TrainingState = 'ready' | 'training' | 'trained';

interface FakeProgressProps {
  state: TrainingState;
  onComplete?: () => void; // optional callback when it hits 100%
}

export function useFakeProgress(state: TrainingState, onComplete?: () => void) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (state === 'training') {
      startTimeRef.current = performance.now();
      hasCompletedRef.current = false;

      const tick = (now: number) => {
        const elapsed = (now - (startTimeRef.current ?? now)) / 1000; // seconds
        const fake = 1 - Math.exp(-elapsed * 1.5); // tweak 1.5 for speed
        const capped = Math.min(fake * 0.95, 0.95); // cap at 95%

        setProgress(capped);
        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (state === 'trained' && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);

      // Smoothly animate to 100%
      const current = progress;
      const duration = 300;
      const start = performance.now();

      const animateToFull = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = current + (1 - current) * t;
        setProgress(eased);

        if (t < 1) {
          frameRef.current = requestAnimationFrame(animateToFull);
        } else {
          onComplete?.();
        }
      };

      frameRef.current = requestAnimationFrame(animateToFull);
    }
  }, [state, progress, onComplete]);

  return progress;
}