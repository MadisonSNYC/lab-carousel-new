import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollRotationOptions {
  sensitivity?: number;
  momentumDecay?: number;
  throttleMs?: number;
}

export function useScrollRotation(options: UseScrollRotationOptions = {}) {
  const {
    sensitivity = 0.5, // degrees per pixel scrolled
    momentumDecay = 0.95, // momentum decay per frame
    throttleMs = 16 // ~60fps
  } = options;

  const [rotation, setRotation] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const rafId = useRef<number>();
  const lastScrollTime = useRef(0);
  const throttleTimeout = useRef<number>();

  const animate = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= momentumDecay;
      
      setRotation(rotationRef.current);
      setIsScrolling(true);
      
      rafId.current = requestAnimationFrame(animate);
    } else {
      setIsScrolling(false);
    }
  }, [momentumDecay]);

  const handleScroll = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const now = Date.now();
    const deltaTime = now - lastScrollTime.current;
    lastScrollTime.current = now;

    // Add to velocity for momentum
    velocityRef.current += event.deltaY * sensitivity;

    // Clear existing throttle
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }

    // Throttle updates
    throttleTimeout.current = window.setTimeout(() => {
      // Start momentum animation if not already running
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    }, throttleMs);
  }, [sensitivity, throttleMs, animate]);

  const stopScrolling = useCallback(() => {
    setIsScrolling(false);
    velocityRef.current = 0;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    }
  }, []);

  const setRotationDirect = useCallback((newRotation: number) => {
    stopScrolling();
    rotationRef.current = newRotation;
    setRotation(newRotation);
  }, [stopScrolling]);

  useEffect(() => {
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    rotation,
    isScrolling,
    handleScroll,
    stopScrolling,
    setRotation: setRotationDirect
  };
}

