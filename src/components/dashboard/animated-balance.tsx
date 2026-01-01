'use client';

import { useEffect, useState } from 'react';

function useSpring(targetValue: number, tension = 170, friction = 26) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  
  useEffect(() => {
    let animationFrameId: number;
    let velocity = 0;

    const animate = () => {
      const displacement = targetValue - currentValue;
      const springForce = displacement * (tension / 1000);
      const dampingForce = -velocity * (friction / 100);
      
      velocity += springForce + dampingForce;
      
      const newPosition = currentValue + velocity;
      
      if (Math.abs(newPosition - targetValue) < 0.01 && Math.abs(velocity) < 0.01) {
        setCurrentValue(targetValue);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }
      
      setCurrentValue(newPosition);
      velocity *= 0.95;
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, tension, friction, currentValue]);

  return currentValue;
}


export default function AnimatedBalance({ value }: { value: number }) {
  const animatedValue = useSpring(value);

  return (
    <h1 className="text-5xl font-bold font-headline text-glow">
      ${animatedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </h1>
  );
}
