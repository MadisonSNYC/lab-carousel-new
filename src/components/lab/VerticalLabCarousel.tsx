import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LabProject, CarouselConfig } from '../../types/carousel';
import { useScrollRotation } from '../../hooks/useScrollRotation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DevPanel, EffectSettings } from '../dev/DevPanel';

interface VerticalLabCarouselProps {
  projects: LabProject[];
  config?: Partial<CarouselConfig>;
  onProjectSelect?: (project: LabProject) => void;
}

// Vertical carousel configuration with 16:9 aspect ratio
const defaultConfig: CarouselConfig = {
  panelCount: 12,
  panelWidth: 240,  // Smaller cards to fit viewport
  panelHeight: 135, // Maintain 16:9 aspect ratio
  perspective: 800, // Adjusted perspective for smaller cards
  autoRotate: true,
  autoRotateSpeed: 20, // seconds per full rotation
};

const defaultEffects: EffectSettings = {
  monitorStyle: true,
  scanLines: true,
  screenGlow: true,
  chromaticAberration: false,
  colorGrading: true,
  enhancedWireframe: false,
  atmosphericGrain: true,
  filmNoise: true,
  cinematicLighting: true,
  depthOfField: true,
  ghostBack: true
};

export function VerticalLabCarousel({ projects, config = {}, onProjectSelect }: VerticalLabCarouselProps) {
  const finalConfig = { ...defaultConfig, ...config };
  const reducedMotion = useReducedMotion();
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<number>();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [effects, setEffects] = useState<EffectSettings>(defaultEffects);
  const [showDevPanel, setShowDevPanel] = useState(true); // Show by default for testing
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);
  const animationRef = useRef<number>();

  // Calculate carousel radius for vertical arrangement with only 3 visible cards
  const calculateVerticalRadius = (panelHeight: number, panelCount: number): number => {
    // We want 3 cards visible, so we need proper spacing
    // Smaller radius for tighter arrangement
    const theta = (2 * Math.PI) / panelCount;
    const baseRadius = panelHeight / (2 * Math.tan(theta / 2));
    return baseRadius * 1.2; // Slightly increase radius to prevent overlap
  };

  const radius = calculateVerticalRadius(finalConfig.panelHeight, projects.length);

  // Smooth animation loop - simple easing only
  useEffect(() => {
    const animate = () => {
      setRotation(currentRotation => {
        const diff = targetRotation - currentRotation;
        const damping = 0.15; // Smooth easing factor
        
        // Apply easing
        if (Math.abs(diff) > 0.01) {
          return currentRotation + diff * damping;
        }
        
        return targetRotation;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetRotation]);

  // Handle scroll for vertical rotation - simple and smooth
  const handleScroll = useCallback((e: WheelEvent) => {
    if (isUserInteracting) return;
    
    e.preventDefault();
    const delta = e.deltaY * 0.2; // Sensitivity for scroll
    
    setTargetRotation(prev => prev + delta);
  }, [isUserInteracting]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('wheel', handleScroll, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleScroll);
    };
  }, [handleScroll]);

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
      const elapsed = (currentTime - startTime) / 1000;
      const rotationSpeed = 360 / finalConfig.autoRotateSpeed;
      
      setRotation(elapsed * rotationSpeed);
      autoRotateRef.current = requestAnimationFrame(animate);
    };

    autoRotateRef.current = requestAnimationFrame(animate);

    return () => {
      if (autoRotateRef.current) {
        cancelAnimationFrame(autoRotateRef.current);
      }
    };
  }, [reducedMotion, finalConfig.autoRotate, finalConfig.autoRotateSpeed, isUserInteracting, isPaused]);

  // Keyboard navigation with smooth transitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setTargetRotation(prev => prev - 30);
      } else if (e.key === 'ArrowDown') {
        setTargetRotation(prev => prev + 30);
      } else if (e.key === 'd' || e.key === 'D') {
        setShowDevPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: `${finalConfig.perspective}px` }}
      >
        <div 
          ref={carouselRef}
          className="relative preserve-3d"
          style={{
            transform: `rotateX(${-rotation}deg)`,
            transformStyle: 'preserve-3d',
            width: `${finalConfig.panelWidth}px`,
            height: `${finalConfig.panelHeight}px`,
            willChange: 'transform',
          }}
        >
          {projects.map((project, index) => {
            const anglePerPanel = 360 / projects.length;
            const angle = index * anglePerPanel;
            
            // Calculate relative angle to determine visibility
            const relativeAngle = ((angle - rotation) % 360 + 360) % 360;
            const normalizedAngle = relativeAngle > 180 ? relativeAngle - 360 : relativeAngle;
            
            // Only show cards within a certain range (3 cards visible)
            const visibleRange = 45; // Degrees range for visibility
            const isVisible = Math.abs(normalizedAngle) <= visibleRange;
            const opacity = isVisible ? 1 - (Math.abs(normalizedAngle) / visibleRange) * 0.5 : 0;
            const scale = isVisible ? 1 - (Math.abs(normalizedAngle) / visibleRange) * 0.2 : 0.8;
            
            return (
              <div
                key={project.id}
                className="absolute inset-0 cursor-pointer transition-all duration-300"
                style={{
                  transform: `rotateX(${angle}deg) translateZ(${radius}px) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  opacity: opacity,
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
                onClick={() => onProjectSelect?.(project)}
              >
                {/* 16:9 Card */}
                <div 
                  className={`
                    w-full h-full rounded-lg overflow-hidden
                    ${effects.monitorStyle ? 'border-2 border-gray-700' : ''}
                    ${effects.screenGlow ? 'shadow-2xl shadow-cyan-500/20' : ''}
                  `}
                  style={{
                    backgroundColor: project.color || '#1a1a1a',
                    backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Content overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Effects overlays */}
                  {effects.scanLines && (
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      <div className="scan-lines"></div>
                    </div>
                  )}
                  
                  {effects.filmNoise && (
                    <div className="absolute inset-0 pointer-events-none opacity-5">
                      <div className="film-noise"></div>
                    </div>
                  )}
                </div>

                {/* Ghost back (dim reverse side) */}
                {effects.ghostBack && (
                  <div
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    style={{
                      transform: 'rotateY(180deg)',
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      backgroundColor: '#0a0a0a',
                      opacity: 0.3,
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-b from-gray-900/50 to-black/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-400 text-sm">
          Scroll or use ↑↓ arrows to rotate • Press D for dev panel
        </p>
      </div>

      {/* Dev Panel */}
      {showDevPanel && (
        <DevPanel
          effects={effects}
          onEffectChange={setEffects}
          onReset={() => setEffects(defaultEffects)}
        />
      )}
    </div>
  );
}