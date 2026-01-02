'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/hooks/use-settings';

function useCountUp(target: number, duration = 1.5) { // Slower duration for a smoother effect
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = count; // Start from the current count to animate changes

    const step = (timestamp: number) => {
      if (!startTimestamp) {
        startTimestamp = timestamp;
      }
      
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const newCount = startValue + (target - startValue) * progress;
      setCount(newCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(target); // Ensure it ends exactly on the target
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  // Re-run animation only when the target value changes
  }, [target, duration]); 

  return count;
}


export default function AnimatedBalance({ value }: { value: number }) {
  const { balanceSize } = useSettings();
  const animatedValue = useCountUp(value);

  return (
    <div 
      className="font-bold font-headline text-glow"
      style={{ fontSize: `${balanceSize}px` }}
    >
      {animatedValue.toLocaleString('es-VE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </div>
  );
}
