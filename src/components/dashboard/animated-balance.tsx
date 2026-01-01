'use client';

import { useEffect, useState } from 'react';

function useCountUp(target: number, duration = 1) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId: number;
    const start = 0;
    const end = target;
    const totalFrames = duration * 60; // 60fps
    let currentFrame = 0;

    const counter = () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const newCount = start + (end - start) * progress;

      if (currentFrame < totalFrames) {
        setCount(newCount);
        frameId = requestAnimationFrame(counter);
      } else {
        setCount(end);
      }
    };

    frameId = requestAnimationFrame(counter);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return count;
}


export default function AnimatedBalance({ value }: { value: number }) {
  const animatedValue = useCountUp(value);

  return (
    <h1 className="text-5xl font-bold font-headline text-glow">
      {animatedValue.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </h1>
  );
}
