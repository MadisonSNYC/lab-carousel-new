import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollRotationOptions {
  sensitivity?: number;
  momentumDecay?: number;
  throttleMs?: number;
}

// Constants for wheel normalization
const SENSITIVITY_DEG_PER_PX = 0.04; // Conservative sensitivity
const LINE_HEIGHT = 16; // Default line height in pixels
const MAX_DEG_PER_TICK = 2; // Max rotation per frame
const FRICTION = 0.94; // Stronger damping

export function useScrollRotation(options: UseScrollRotationOptions = {}) {
  const {
    sensitivity = SENSITIVITY_DEG_PER_PX, // degrees per pixel scrolled
    momentumDecay = FRICTION, // momentum decay per frame
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
    // Note: preventDefault is now handled by the governance guard in the wrapper
    
    const now = Date.now();
    const deltaTime = now - lastScrollTime.current;
    lastScrollTime.current = now;

    // Normalize wheel delta to pixels
    let deltaPixels = event.deltaY;
    if (event.deltaMode === 1) { // DOM_DELTA_LINE
      deltaPixels = event.deltaY * LINE_HEIGHT;
    } else if (event.deltaMode === 2) { // DOM_DELTA_PAGE
      deltaPixels = event.deltaY * window.innerHeight;
    }

    // Add to velocity for momentum (with clamping)
    const newVelocity = velocityRef.current + (deltaPixels * sensitivity);
    velocityRef.current = Math.max(-MAX_DEG_PER_TICK, Math.min(MAX_DEG_PER_TICK, newVelocity));

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

