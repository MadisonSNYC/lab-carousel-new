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
  panelWidth: 200,  // Base size (will scale up for center)
  panelHeight: 112, // Maintain 16:9 aspect ratio
  perspective: 800, // Adjusted perspective
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
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate carousel radius for proper circular arrangement
  const calculateVerticalRadius = (panelHeight: number, panelCount: number): number => {
    // Calculate radius to fit cards in a circle with proper spacing
    const theta = (2 * Math.PI) / panelCount;
    const baseRadius = panelHeight / (2 * Math.tan(theta / 2));
    return baseRadius * 1.5; // Increase radius to prevent overlap
  };

  const radius = calculateVerticalRadius(finalConfig.panelHeight, projects.length);

  // Handle hover with delay for center-ish cards
  const handleCardHover = (projectId: string, normalizedAngle: number) => {
    // Allow hover for cards reasonably close to center
    if (Math.abs(normalizedAngle) > 15) return;
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set hover after 200ms delay
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCardId(projectId);
    }, 200);
  };

  const handleCardLeave = () => {
    // Clear timeout if hovering off before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Immediately remove hover effect when leaving
    setHoveredCardId(null);
  };

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
    
    // Check if the scroll event is coming from the dev panel
    const target = e.target as HTMLElement;
    if (target.closest('[data-dev-panel]')) {
      return; // Don't handle scroll if it's from dev panel
    }
    
    e.preventDefault();
    const delta = e.deltaY * 0.05; // Much less sensitive
    
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

    let lastTime: number = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      const rotationSpeed = 360 / finalConfig.autoRotateSpeed;
      
      // Add to target rotation instead of setting it directly
      setTargetRotation(prev => prev + (deltaTime * rotationSpeed));
      
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
            
            // Calculate relative angle to determine visibility without wrapping
            const currentRotationMod = rotation % 360;
            const relativeAngle = angle - currentRotationMod;
            const normalizedAngle = ((relativeAngle + 180) % 360) - 180;
            
            // Only show cards within a certain range (3 cards visible)
            const visibleRange = 45; // Degrees range for visibility
            const isVisible = Math.abs(normalizedAngle) <= visibleRange;
            
            // Calculate opacity - fade out at edges
            const opacity = isVisible ? 1 - (Math.abs(normalizedAngle) / visibleRange) * 0.5 : 0;
            
            // Determine if THIS card is the center (closest to 0 degrees)
            const distanceFromCenter = Math.abs(normalizedAngle);
            let isCenterCard = false;
            
            // Only one card can be center - the one closest to 0 degrees
            if (isVisible && distanceFromCenter <= 15) {
              // Check if this is THE closest card to center
              let isClosest = true;
              for (let i = 0; i < projects.length; i++) {
                if (i !== index) {
                  const otherAngle = i * anglePerPanel;
                  const otherRelative = otherAngle - currentRotationMod;
                  const otherNormalized = ((otherRelative + 180) % 360) - 180;
                  const otherDistance = Math.abs(otherNormalized);
                  if (otherDistance < distanceFromCenter && otherDistance <= 15) {
                    isClosest = false;
                    break;
                  }
                }
              }
              isCenterCard = isClosest;
            }
            
            // Clean positioning based on card location
            let cardPosition = 'hidden';
            let foldRotation = 0;
            let cardScale = 1;
            let additionalZ = 0;
            
            if (isVisible) {
              if (isCenterCard) {
                // Only ONE center card
                cardPosition = 'center';
                foldRotation = 0; // Perfectly flat
                cardScale = 1.2; // Larger
                additionalZ = 10; // Forward
              } else if (normalizedAngle < 0) {
                // Top card
                cardPosition = 'top';
                foldRotation = 15; // Tilt back
                cardScale = 1.0;
                additionalZ = 0;
              } else {
                // Bottom card
                cardPosition = 'bottom';
                foldRotation = -15; // Tilt forward
                cardScale = 1.0;
                additionalZ = 0;
              }
            }
            
            // Z-index for layering - center card on top
            const zIndex = cardPosition === 'center' ? 10 : cardPosition !== 'hidden' ? 5 : 0;
            
            return (
              <div
                key={project.id}
                className={`absolute inset-0 transition-all ${cardPosition === 'center' ? 'cursor-pointer duration-300' : 'cursor-default duration-500'}`}
                style={{
                  transform: `
                    rotateX(${angle + foldRotation}deg) 
                    translateZ(${radius + additionalZ}px) 
                    scale(${cardScale})
                  `,
                  transformStyle: 'preserve-3d',
                  opacity: cardPosition !== 'hidden' ? 1 : 0,
                  pointerEvents: isCenterCard ? 'auto' : 'none',
                  zIndex: zIndex,
                  transformOrigin: 'center center',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={() => isCenterCard && handleCardHover(project.id, normalizedAngle)}
                onMouseLeave={() => isCenterCard && handleCardLeave()}
                onClick={() => isCenterCard && onProjectSelect?.(project)}
              >
                {/* 16:9 Card */}
                <div 
                  className={`
                    w-full h-full rounded-lg overflow-hidden relative transition-shadow duration-300
                    ${effects.monitorStyle ? 'border-2 border-gray-700' : ''}
                    ${effects.screenGlow ? 'shadow-2xl shadow-cyan-500/20' : ''}
                    ${isCenterCard && hoveredCardId === project.id ? 'shadow-lg shadow-cyan-400/20' : ''}
                  `}
                  style={{
                    backgroundColor: '#0a0a0a',
                  }}
                >
                  {/* Video or Image Background */}
                  {project.videoUrl ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      src={project.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 w-full h-full"
                      style={{
                        backgroundImage: `url(${project.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                  
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
          rotation={rotation}
          onRotationChange={setTargetRotation}
        />
      )}
    </div>
  );
}