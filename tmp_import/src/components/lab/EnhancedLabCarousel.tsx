import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EnhancedLabTile } from './EnhancedLabTile';
import { LabProject, CarouselConfig } from '../../types/carousel';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DevPanel, EffectSettings } from '../dev/DevPanel';
import { EffectLayers } from '../effects/EffectLayers';
import { EnhancedWireframe } from '../effects/EnhancedWireframe';
import { 
  calculateCarouselRadius, 
  calculatePanelTransform, 
  getClosestPanelIndex 
} from '../../utils/carouselMath';

interface EnhancedLabCarouselProps {
  projects: LabProject[];
  config?: Partial<CarouselConfig>;
  onProjectSelect?: (project: LabProject) => void;
}

  const defaultConfig: CarouselConfig = {
    panelCount: 12,
    panelWidth: 120, // Small fixed width like in screenshot
    panelHeight: 200, // Small fixed height maintaining 9:16 ratio
    perspective: 1200, // Reduced perspective for smaller cards
    autoRotate: true,
    autoRotateSpeed: 20, // seconds per full rotation
  };

const defaultEffects: EffectSettings = {
  monitorStyle: false,
  curvedPanels: false,
  scanLines: false,
  screenGlow: false,
  chromaticAberration: false,
  colorGrading: false,
  enhancedWireframe: false,
  atmosphericGrain: false,
  filmNoise: false,
  cinematicLighting: false,
  depthOfField: false
};

export function EnhancedLabCarousel({ projects, config = {}, onProjectSelect }: EnhancedLabCarouselProps) {
  const finalConfig = { ...defaultConfig, ...config };
  const reducedMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<number>();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [effects, setEffects] = useState<EffectSettings>(defaultEffects);
  const [showDevPanel, setShowDevPanel] = useState(true);

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
    if (event.key === 'd' || event.key === 'D') {
      setShowDevPanel(!showDevPanel);
      return;
    }

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
  }, [rotation, setRotation, projects.length, isPaused, reducedMotion, showDevPanel]);

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

  // Effect handlers
  const handleEffectChange = useCallback((newEffects: EffectSettings) => {
    setEffects(newEffects);
  }, []);

  const handleResetEffects = useCallback(() => {
    setEffects(defaultEffects);
  }, []);

  // Reduced motion fallback
  if (reducedMotion) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {showDevPanel && (
          <DevPanel
            effects={effects}
            onEffectChange={handleEffectChange}
            onReset={handleResetEffects}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={project.id} className="relative">
              <EnhancedLabTile
                project={project}
                index={index}
                isActive={index === activeIndex}
                transform="none"
                effects={effects}
                onClick={() => handleProjectSelect(project, index)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <EffectLayers effects={effects}>
      <div 
        ref={containerRef}
        className="lab-carousel-container relative w-full h-screen overflow-hidden bg-black"
        style={{ marginRight: showDevPanel ? '320px' : '0' }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="3D Project Gallery Carousel"
        aria-describedby="carousel-instructions"
      >
        {/* Dev Panel */}
        {showDevPanel && (
          <DevPanel
            effects={effects}
            onEffectChange={handleEffectChange}
            onReset={handleResetEffects}
          />
        )}

        {/* Instructions for screen readers */}
        <div id="carousel-instructions" className="sr-only">
          Use arrow keys to navigate between projects. Press space to pause auto-rotation. Press escape to reset interaction. Press 'D' to toggle dev panel.
        </div>

        {/* Skip to content link */}
        <a 
          href="#carousel-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-500 text-black px-4 py-2 rounded z-50"
        >
          Skip to carousel content
        </a>

        {/* 3D Scene Container */}
        <div 
          className="lab-carousel-scene absolute inset-0 flex items-center justify-center"
          style={{ 
            perspective: `${finalConfig.perspective}px`,
            perspectiveOrigin: '50% 50%'
          }}
        >
          <div
            ref={carouselRef}
            className="lab-carousel relative preserve-3d"
            style={{
              transformStyle: 'preserve-3d',
              // Remove container rotation - let individual panels handle positioning
              width: `${finalConfig.panelWidth}px`,
              height: `${finalConfig.panelHeight}px`,
              margin: 'auto'
            }}
            id="carousel-content"
          >
            {projects.map((project, index) => {
              // Use CSS variables approach from the other chat
              const angleDeg = 360 / Math.max(projects.length, 1);
              const tileVars = {
                '--tile-index': String(index),
                '--tile-angle': `${angleDeg}deg`,
                '--radius': `${radius}px`,
                '--global-rotation': `${rotation}deg`
              };
              
              return (
                <EnhancedLabTile
                  key={project.id}
                  project={project}
                  index={index}
                  isActive={index === activeIndex}
                  transform="" // Transform handled by CSS variables
                  effects={effects}
                  onClick={() => handleProjectSelect(project, index)}
                  style={tileVars}
                />
              );
            })}
          </div>
        </div>

        {/* Enhanced Wireframe Structure */}
        <EnhancedWireframe enabled={effects.enhancedWireframe} />

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
          <div>D Dev Panel</div>
        </div>
      </div>
    </EffectLayers>
  );
}

