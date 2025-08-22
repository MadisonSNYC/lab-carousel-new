import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LabTile } from './LabTile';
import { LabProject, CarouselConfig } from '../../types/carousel';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { 
  calculateCarouselRadius, 
  calculatePanelTransform, 
  getClosestPanelIndex,
  normalizeAngle 
} from '../../utils/carouselMath';

interface LabCarouselProps {
  projects: LabProject[];
  config?: Partial<CarouselConfig>;
  onProjectSelect?: (project: LabProject) => void;
}

const defaultConfig: CarouselConfig = {
  panelCount: 8,
  panelWidth: 280,
  panelHeight: 200,
  perspective: 800,
  rotationSpeed: 90,
  scrollSensitivity: 0.3,
  autoRotate: true,
  autoRotateSpeed: 180
};

export function LabCarousel({ projects, config = {}, onProjectSelect }: LabCarouselProps) {
  const finalConfig = { ...defaultConfig, ...config };
  const reducedMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<number>();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate carousel dimensions
  const radius = calculateCarouselRadius(finalConfig.panelWidth, projects.length);
  
  // Scroll rotation hook
  const { rotation, isScrolling, handleScroll, setRotation } = useScrollRotation({
    sensitivity: finalConfig.scrollSensitivity,
    momentum: !reducedMotion
  });

  // Auto-rotation effect
  useEffect(() => {
    if (reducedMotion || !finalConfig.autoRotate || isUserInteracting || isPaused) {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
      return;
    }

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const rotationAmount = (elapsed / (finalConfig.autoRotateSpeed * 1000)) * 360;
      
      if (!isScrolling) {
        setRotation(rotationAmount);
      }
      
      autoRotateRef.current = requestAnimationFrame(animate);
    };

    autoRotateRef.current = requestAnimationFrame(animate);

    return () => {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, [finalConfig.autoRotate, finalConfig.autoRotateSpeed, isUserInteracting, isPaused, isScrolling, reducedMotion, setRotation]);

  // Update active index based on rotation
  useEffect(() => {
    const newActiveIndex = getClosestPanelIndex(-rotation, projects.length);
    setActiveIndex(newActiveIndex);
  }, [rotation, projects.length]);

  // Scroll event handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    const handleWheelEvent = (event: WheelEvent) => {
      handleScroll(event);
      setIsUserInteracting(true);
      
      // Reset user interaction after delay
      setTimeout(() => setIsUserInteracting(false), 2000);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [handleScroll, reducedMotion]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (reducedMotion) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setRotation(rotation - (360 / projects.length));
        setIsUserInteracting(true);
        break;
      case 'ArrowRight':
        event.preventDefault();
        setRotation(rotation + (360 / projects.length));
        setIsUserInteracting(true);
        break;
      case ' ':
        event.preventDefault();
        setIsPaused(!isPaused);
        break;
      case 'Escape':
        event.preventDefault();
        setIsUserInteracting(false);
        setIsPaused(false);
        break;
    }
  }, [rotation, setRotation, projects.length, isPaused, reducedMotion]);

  // Project selection handler
  const handleProjectSelect = useCallback((project: LabProject, index: number) => {
    onProjectSelect?.(project);
    
    // Rotate to center the selected project
    if (!reducedMotion) {
      const targetRotation = -(360 / projects.length) * index;
      setRotation(targetRotation);
      setIsUserInteracting(true);
    }
  }, [onProjectSelect, projects.length, setRotation, reducedMotion]);

  // Reduced motion fallback
  if (reducedMotion) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="relative">
              <LabTile
                project={project}
                index={index}
                isActive={index === activeIndex}
                transform="none"
                onClick={() => handleProjectSelect(project, index)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="lab-carousel-container relative w-full h-screen overflow-hidden bg-black"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="3D Project Gallery Carousel"
      aria-describedby="carousel-instructions"
    >
      {/* Instructions for screen readers */}
      <div id="carousel-instructions" className="sr-only">
        Use arrow keys to navigate between projects. Press space to pause auto-rotation. Press escape to reset interaction.
      </div>

      {/* Skip to content link */}
      <a 
        href="#carousel-content" 
        className="
          sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
          bg-cyan-500 text-black px-4 py-2 rounded z-50
        "
      >
        Skip to carousel content
      </a>

      {/* 3D Scene Container */}
      <div 
        className="lab-carousel-scene absolute inset-0 flex items-center justify-center"
        style={{ 
          perspective: `${finalConfig.perspective}px`,
          perspectiveOrigin: 'center center'
        }}
      >
        <div
          ref={carouselRef}
          className="lab-carousel relative preserve-3d"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            transition: isScrolling ? 'none' : 'transform 0.3s ease-out'
          }}
          id="carousel-content"
        >
          {projects.map((project, index) => {
            // For true cylinder, we don't add global rotation to individual panels
            const transform = calculatePanelTransform(index, projects.length, radius, 0);
            
            return (
              <LabTile
                key={project.id}
                project={project}
                index={index}
                isActive={index === activeIndex}
                transform={transform}
                onClick={() => handleProjectSelect(project, index)}
              />
            );
          })}
        </div>
      </div>

      {/* Central Wireframe Structure */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-32 h-32">
          {/* Wireframe lines */}
          <div className="absolute inset-0 border border-cyan-500/20 rotate-45" />
          <div className="absolute inset-2 border border-cyan-500/15 rotate-12" />
          <div className="absolute inset-4 border border-cyan-500/10" />
          
          {/* Central dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 bg-cyan-500/30 rounded-full" />
        </div>
      </div>

      {/* Atmospheric Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grain texture */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px'
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
      </div>

      {/* Controls and Status */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-white/70 text-sm">
        <span>Project {activeIndex + 1} of {projects.length}</span>
        <span className="text-cyan-400">{projects[activeIndex]?.title}</span>
        {isPaused && <span className="text-yellow-400">Paused</span>}
      </div>

      {/* Navigation hints */}
      <div className="absolute top-6 right-6 text-white/50 text-xs space-y-1">
        <div>← → Navigate</div>
        <div>Space Pause</div>
        <div>Scroll Rotate</div>
      </div>
    </div>
  );
}

