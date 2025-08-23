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
    perspective: 1800, // Increased perspective for less foreshortening (was 1200)
    autoRotate: true,
    autoRotateSpeed: 20, // seconds per full rotation
  };

// Detect desktop for chromatic aberration (mobile budget)
const isDesktop = () => !window.matchMedia('(max-width: 640px)').matches;

const defaultEffects: EffectSettings = {
  monitorStyle: true,           // Screen bezel/edge glow
  scanLines: true,              // Subtle CRT lines
  screenGlow: true,             // Screen glow effect (cinematic lighting)
  chromaticAberration: typeof window !== 'undefined' ? isDesktop() : false, // Desktop only
  colorGrading: true,           // Cinematic color treatment
  enhancedWireframe: false,     // Leave false until implemented
  atmosphericGrain: true,       // Faint film grain
  filmNoise: true,              // Static noise
  cinematicLighting: true,      // Soft gradient vignette
  depthOfField: true,           // DoF-lite angle-based blur
  ghostBack: true               // Double-sided dim backs
};

export function EnhancedLabCarousel({ projects, config = {}, onProjectSelect }: EnhancedLabCarouselProps) {
  const finalConfig = { ...defaultConfig, ...config };
  const reducedMotion = useReducedMotion();
  
  // Apply PRM overrides to default effects
  const prmAdjustedEffects = reducedMotion ? {
    ...defaultEffects,
    depthOfField: false,  // Force DoF OFF for reduced motion
    // Keep overlays and ghostBack ON (they're static)
  } : defaultEffects;
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<number>();
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [effects, setEffects] = useState<EffectSettings>(prmAdjustedEffects);
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Dev-only: Clear stale localStorage on first run to ensure new defaults apply
  useEffect(() => {
    if (import.meta.env?.DEV) {
      const storageKey = 'labEffectsV3'; // Versioned key - removed curvedPanels
      if (!localStorage.getItem(storageKey)) {
        localStorage.removeItem('labEffects'); // Clear old key if exists
        localStorage.removeItem('labEffectsV2'); // Clear v2 key with curvedPanels
        localStorage.setItem(storageKey, 'cleared'); // Mark as cleared
      }
    }
  }, []);

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

  // 3D Depth effects updater (tilt/scale/pop + optional DoF)
  useEffect(() => {
    if (reducedMotion) {
      // Clear all effects in reduced motion
      tileRefs.current.forEach(tile => {
        if (tile) {
          tile.style.removeProperty('--d');
          tile.style.removeProperty('--back');
          tile.style.removeProperty('--tilt');
          tile.style.removeProperty('--scale');
          tile.style.removeProperty('--pop');
          tile.style.removeProperty('--front-o');
          tile.style.removeProperty('--ghost-o');
          tile.style.removeProperty('--bias-scale');
          tile.style.removeProperty('--bias-tilt-deg');
        }
      });
      if (containerRef.current) {
        containerRef.current.removeAttribute('data-dof');
      }
      return;
    }

    // Set data attribute for DoF CSS rules (only when DoF effect is on)
    if (containerRef.current && effects.depthOfField) {
      containerRef.current.setAttribute('data-dof', 'on');
    } else if (containerRef.current) {
      containerRef.current.removeAttribute('data-dof');
    }

    const update3DEffects = () => {
      const step = 360 / projects.length;
      const currentRotation = rotation % 360;
      let tilesUpdated = 0; // Track workload for performance
      
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        
        // Calculate angle difference from front
        const tileAngle = i * step;
        let delta = ((tileAngle - currentRotation + 540) % 360) - 180;
        const absDelta = Math.abs(delta);
        
        // Workload sanity: only write vars for tiles near the front wedge (≤120°) or major changes
        const isNearWedge = absDelta <= 120; // ~6-8 tiles on typical carousels
        if (!isNearWedge && tilesUpdated >= 8) {
          return; // Skip distant tiles after updating 8 near-wedge tiles
        }
        tilesUpdated++;
        
        // Depth calculation for DoF (blur based on angle from front)
        let depth = 0;
        if (absDelta < 30) {
          tile.style.removeProperty('--d');
        } else {
          depth = Math.min(absDelta / 90, 1);
          tile.style.setProperty('--d', depth.toFixed(3));
        }
        
        // Depth-based tilt, scale, and pop for 3D effect
        const EXISTING_TILT_MAX = 6; // degrees
        const FRONT_BOOST = 0.03; // +3% for front tiles
        const SIDE_SHRINK = 0.08; // -8% for side tiles  
        const POP_Z = 12; // pixels
        
        const tilt = -EXISTING_TILT_MAX * depth; // negative = inward lean
        const scale = 1 + FRONT_BOOST * (1 - depth) - SIDE_SHRINK * depth;
        const pop = POP_Z * (1 - depth);
        
        tile.style.setProperty('--tilt', tilt.toFixed(3));
        tile.style.setProperty('--scale', scale.toFixed(3));
        tile.style.setProperty('--pop', pop.toFixed(1));
        
        // Clamped front opacity (don't let front wedge disappear)
        const DOF_SLOPE_DESKTOP = 0.45;
        const DOF_SLOPE_MOBILE = 0.35;
        const FRONT_FLOOR_DESKTOP = 0.42;
        const FRONT_FLOOR_MOBILE = 0.48;
        
        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        const dofSlope = isMobile ? DOF_SLOPE_MOBILE : DOF_SLOPE_DESKTOP;
        const frontFloor = isMobile ? FRONT_FLOOR_MOBILE : FRONT_FLOOR_DESKTOP;
        
        const frontRaw = 1 - depth * dofSlope;
        const frontClamped = Math.max(frontRaw, frontFloor);
        tile.style.setProperty('--front-o', frontClamped.toFixed(3));
        
        // Per-tile bias (depth-driven size and tilt)
        const SCALE_FRONT = 0.03;   // +3% at front
        const SCALE_SIDE = 0.08;    // -8% at side  
        const BIAS_TILT_MAX = 5;    // deg (inward bow per tile)
        
        const biasScale = 1 + SCALE_FRONT * (1 - depth) - SCALE_SIDE * depth;
        const biasTilt = -BIAS_TILT_MAX * depth;
        
        tile.style.setProperty('--bias-scale', biasScale.toFixed(3));
        tile.style.setProperty('--bias-tilt-deg', biasTilt.toFixed(3));
        
        // Back fade calculation for cross-fade (55° to 75° fade window - earlier dimming)
        const FADE_START = 55;
        const FADE_END = 75;
        
        if (absDelta < FADE_START) {
          tile.style.removeProperty('--back');
          tile.style.setProperty('--ghost-o', '0'); // No ghost for front tiles
        } else if (absDelta >= FADE_END) {
          tile.style.setProperty('--back', '1');
          // Full back fade - calculate ghost opacity
          const GHOST_MAX_DESKTOP = 0.28;
          const GHOST_MAX_MOBILE = 0.22;
          const ghostMax = isMobile ? GHOST_MAX_MOBILE : GHOST_MAX_DESKTOP;
          tile.style.setProperty('--ghost-o', ghostMax.toFixed(3));
        } else {
          // Linear interpolation in fade window
          const backFade = (absDelta - FADE_START) / (FADE_END - FADE_START);
          tile.style.setProperty('--back', backFade.toFixed(3));
          
          // Delayed ghost opacity (only show ghost when truly in rear)
          const GHOST_GATE = 0.40; // don't show ghost until back >= 0.40
          const GHOST_MAX_DESKTOP = 0.28;
          const GHOST_MAX_MOBILE = 0.22;
          
          const ghostMax = isMobile ? GHOST_MAX_MOBILE : GHOST_MAX_DESKTOP;
          const ghostRange = 1 - GHOST_GATE;
          const ghostPhase = backFade <= GHOST_GATE ? 0 : (backFade - GHOST_GATE) / ghostRange;
          const ghostOpacity = ghostPhase * ghostMax;
          
          tile.style.setProperty('--ghost-o', ghostOpacity.toFixed(3));
        }
      });
    };

    // Run on every rotation change
    update3DEffects();
    
    return () => {
      // Cleanup
      tileRefs.current.forEach(tile => {
        if (tile) {
          tile.style.removeProperty('--d');
          tile.style.removeProperty('--back');
          tile.style.removeProperty('--tilt');
          tile.style.removeProperty('--scale');
          tile.style.removeProperty('--pop');
          tile.style.removeProperty('--front-o');
          tile.style.removeProperty('--ghost-o');
          tile.style.removeProperty('--bias-scale');
          tile.style.removeProperty('--bias-tilt-deg');
        }
      });
      if (containerRef.current) {
        containerRef.current.removeAttribute('data-dof');
      }
    };
  }, [rotation, projects.length, effects.depthOfField, reducedMotion]);

  // Scroll event handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    // Governance guard helper
    const isInsideScrollable = (e: WheelEvent): boolean => {
      const path = e.composedPath?.() ?? [];
      for (const n of path) {
        if (!(n instanceof HTMLElement)) continue;
        if (n.dataset?.scrollAllow) return true;
        const cs = getComputedStyle(n);
        const scrollable = /auto|scroll/.test(cs.overflowY) && n.scrollHeight > n.clientHeight;
        if (scrollable) return true;
      }
      return false;
    };

    const handleWheelEvent = (event: WheelEvent) => {
      // Dev instrumentation - log wheel events
      if (import.meta.env?.DEV) {
        const path = event.composedPath?.() ?? [];
        const hit = path.find(n => n instanceof HTMLElement && (n.dataset?.scrollAllow || getComputedStyle(n).overflowY.match(/auto|scroll/)));
        console.debug('[wheel]', { 
          target: event.target, 
          passive: event.cancelable === false, 
          prevented: event.defaultPrevented, 
          deltaMode: event.deltaMode, 
          deltaY: event.deltaY, 
          hitScrollable: !!hit 
        });
      }

      // Governance guard: native scroll wins in scrollables
      if (isInsideScrollable(event)) return; // do NOT preventDefault, do NOT rotate
      
      // Otherwise we are over the carousel → prevent default and rotate
      event.preventDefault();
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

  // Global dev-only "D" key listener for DevPanel toggle
  useEffect(() => {
    // Only in development mode
    if (import.meta.env?.DEV !== true) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Ignore if modifier keys are pressed
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      
      // Ignore if typing in an input field
      const target = event.target as HTMLElement;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
        if (target.contentEditable === 'true') return;
        if (target.getAttribute('role') === 'textbox') return;
      }
      
      // Toggle DevPanel on "D" key
      if (event.key === 'd' || event.key === 'D') {
        setShowDevPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []); // Empty deps since we use state setter function

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
        style={{ 
          marginRight: showDevPanel ? '320px' : '0',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y pinch-zoom'
        }}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsUserInteracting(true)}
        onMouseLeave={() => setIsUserInteracting(false)}
        onFocusCapture={() => setIsUserInteracting(true)}
        onBlurCapture={(e) => {
          // Only unpause if focus leaves the carousel entirely
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsUserInteracting(false);
          }
        }}
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
            <div className="lab-track" style={{ ['--track-tilt-deg' as any]: '-6' }}>
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
                  <div
                    key={project.id}
                    ref={el => tileRefs.current[index] = el}
                    style={tileVars}
                  >
                    <EnhancedLabTile
                      project={project}
                      index={index}
                      isActive={index === activeIndex}
                      transform="" // Transform handled by CSS variables
                      effects={effects}
                      onClick={() => handleProjectSelect(project, index)}
                    />
                  </div>
                );
              })}
            </div>
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

