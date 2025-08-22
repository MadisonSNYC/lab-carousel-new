import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  isLowPerformance: boolean;
  deviceCapabilities: {
    hardwareConcurrency: number;
    deviceMemory?: number;
    connection?: string;
  };
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    isLowPerformance: false,
    deviceCapabilities: {
      hardwareConcurrency: navigator.hardwareConcurrency || 4
    }
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrame = useRef<number>();

  useEffect(() => {
    // Detect device capabilities
    const capabilities = {
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection?.effectiveType
    };

    // Monitor frame rate
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          isLowPerformance: fps < 30 || capabilities.hardwareConcurrency < 4,
          deviceCapabilities: capabilities
        }));

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame.current = requestAnimationFrame(measureFPS);
    };

    animationFrame.current = requestAnimationFrame(measureFPS);

    // Memory monitoring (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit
      }));
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return metrics;
}

