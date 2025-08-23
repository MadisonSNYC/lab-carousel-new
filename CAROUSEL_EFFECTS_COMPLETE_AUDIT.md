# READ-ONLY CAROUSEL EFFECTS AUDIT - COMPLETE CODE PATHS

## 1. CORE 3D LAYOUT - CYLINDRICAL POSITIONING

### Transform Implementation
**File**: `src/components/lab/EnhancedLabTile.tsx:76`
```css
transform: translate(-50%, -50%) rotateY(calc(var(--tile-index) * var(--tile-angle) + var(--global-rotation))) translateZ(var(--radius))
```

### CSS 3D Context
**File**: `src/styles/lab.css:1-31`
```css
.lab-carousel-container {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}

.lab-carousel {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.lab-tile {
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  -webkit-backface-visibility: visible;
  backface-visibility: visible;
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}
```

### Tile Content Face
**File**: `src/styles/lab.css:34-40`
```css
.lab-tile .tile-content {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.5s ease-out, filter 0.5s ease-out, opacity 0.5s ease-out;
}
```

---

## 2. TRACK TILT (GLOBAL LEAN)

### CSS Transform
**File**: `src/styles/lab.css:42-47`
```css
.lab-track {
  transform-style: preserve-3d;
  /* guaranteed lean; composes with per-tile rotateY because it's on a parent */
  transform: rotateX(calc(var(--track-tilt-deg, -6) * 1deg));
}
```

### JS Implementation
**File**: `src/components/lab/EnhancedLabCarousel.tsx:514`
```jsx
<div className="lab-track" style={{ ['--track-tilt-deg' as any]: '-6' }}>
```

---

## 3. DEPTH OF FIELD (DoF)

### JavaScript Control Logic
**File**: `src/components/lab/EnhancedLabCarousel.tsx:126-183`
```javascript
// Set data attribute for DoF CSS rules (only when DoF effect is on)
if (containerRef.current && effects.depthOfField) {
  containerRef.current.setAttribute('data-dof', 'on');
} else if (containerRef.current) {
  containerRef.current.removeAttribute('data-dof');
}

// Depth calculation for DoF (blur based on angle from front)
let depth = 0;
if (absDelta < 30) {
  tile.style.removeProperty('--d');
} else {
  depth = Math.min(absDelta / 90, 1);
  tile.style.setProperty('--d', depth.toFixed(3));
}
```

### CSS Blur Mapping - Desktop
**File**: `src/styles/lab.css:214-238`
```css
@media (min-width: 641px) {
  [data-dof="on"] .lab-tile .tile-content {
    transition: filter 0.5s ease-out, opacity 0.5s ease-out, transform 0.3s ease-out;
  }
  
  /* Apply blur and clamped opacity */
  [data-dof="on"] .lab-tile[style*="--d"] .tile-content {
    /* Max blur 4.5px for desktop */
    filter: blur(calc(var(--d, 0) * 4.5px));
    /* Use clamped front opacity (prevents disappearing) */
    opacity: var(--front-o, 1);
  }
  
  /* Ensure front tiles remain sharp */
  [data-dof="on"] .lab-tile:not([style*="--d"]) .tile-content {
    filter: blur(0);
    opacity: var(--front-o, 1);
  }
}
```

### CSS Blur Mapping - Mobile
**File**: `src/styles/lab.css:241-265`
```css
@media (max-width: 640px) {
  [data-dof="on"] .lab-tile[style*="--d"] .tile-content {
    /* Max blur 2px for mobile (performance) */
    filter: blur(calc(var(--d, 0) * 2px));
    /* Use clamped front opacity */
    opacity: var(--front-o, 1);
  }
}
```

### Opacity Clamping Logic
**File**: `src/components/lab/EnhancedLabCarousel.tsx:199-211`
```javascript
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
```

---

## 4. GHOST BACK (DOUBLE-SIDED TILES)

### JavaScript Gating and Opacity Calculation
**File**: `src/components/lab/EnhancedLabCarousel.tsx:224-254`
```javascript
// Back fade calculation for cross-fade (55° to 75° fade window)
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
```

### CSS Implementation
**File**: `src/styles/lab.css:294-325`
```css
.lab-tile[data-ghost="on"]::after {
  content: "";
  position: absolute;
  top: 50%; 
  left: 50%;
  width: var(--panel-w, 120px);
  height: var(--panel-h, 200px);
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  /* Face the camera when the tile faces away */
  transform: translate(-50%, -50%) rotateY(180deg) translateZ(0.01px);
  
  /* Use the same image as the front, via CSS var */
  background-image: var(--tile-bg);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  
  /* "Ghost" look — uses delayed ghost opacity */
  filter: grayscale(1) blur(calc(1px + var(--back, 0) * 2px)) brightness(0.8);
  opacity: var(--ghost-o, 0);
  pointer-events: none;
  
  z-index: -1;
  transition: opacity 0.3s ease-out;
}
```

### Image Variable Setup
**File**: `src/components/lab/EnhancedLabTile.tsx:80-82`
```javascript
// Set image URL as CSS variable for ghost back effect
'--tile-bg': `url("${imageSrc}")`,
'--panel-w': '120px',
'--panel-h': '200px'
```

---

## 5. PER-TILE BIAS (SIZE & INWARD TILT)

### JavaScript Calculation
**File**: `src/components/lab/EnhancedLabCarousel.tsx:213-222`
```javascript
// Per-tile bias (depth-driven size and tilt)
const SCALE_FRONT = 0.03;   // +3% at front
const SCALE_SIDE = 0.08;    // -8% at side  
const BIAS_TILT_MAX = 5;    // deg (inward bow per tile)

const biasScale = 1 + SCALE_FRONT * (1 - depth) - SCALE_SIDE * depth;
const biasTilt = -BIAS_TILT_MAX * depth;

tile.style.setProperty('--bias-scale', biasScale.toFixed(3));
tile.style.setProperty('--bias-tilt-deg', biasTilt.toFixed(3));
```

### CSS Application
**File**: `src/styles/lab.css:49-62`
```css
.lab-tile :where(.tile-content, .curved-wrap) {
  transform-origin: center center;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  
  /* Face transform with bias: per-tile tilt and scale based on depth */
  transform: 
    translateZ(var(--pop, 0px))
    rotateX(calc(var(--bias-tilt-deg, 0) * 1deg))
    scale(var(--bias-scale, 1));
  
  will-change: transform;
}
```

---

## 6. MONITOR STYLE / SCREEN EFFECTS

### Monitor Style CSS
**File**: `src/styles/effects.css:59-80`
```css
.lab-tile.monitor-style {
  border-radius: 0;
  box-shadow: 
    0 0 14px rgba(0, 0, 0, 0.56),
    inset 0 0 0 3px rgba(42, 42, 42, 0.7),
    inset 0 0 0 6px rgba(26, 26, 26, 0.7);
}

.lab-tile.monitor-style::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(135deg, 
    rgba(58, 58, 58, 0.7) 0%,
    rgba(26, 26, 26, 0.7) 50%, 
    rgba(10, 10, 10, 0.7) 100%);
  border-radius: 2px;
  z-index: -1;
}
```

### Screen Glow
**File**: `src/styles/effects.css:83-88`
```css
.screen-glow {
  box-shadow: 
    0 0 16px rgba(6, 182, 212, 0.22),
    0 0 32px rgba(6, 182, 212, 0.15),
    0 0 48px rgba(6, 182, 212, 0.08);
}
```

### Scan Lines
**File**: `src/styles/effects.css:101-125`
```css
.scan-lines::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 255, 0.03) 2px,
    rgba(0, 255, 255, 0.03) 4px
  );
  pointer-events: none;
}

.scan-lines-overlay {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(6, 182, 212, 0.1) 2px,
    rgba(6, 182, 212, 0.1) 4px
  );
}
```

---

## 7. CHROMATIC ABERRATION (RGB EDGE)

### Component Implementation
**File**: `src/components/effects/EffectLayers.tsx:46-57`
```jsx
function ChromaticAberrationOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none chromatic-aberration-overlay">
      {/* Red channel offset */}
      <div className="absolute inset-0 mix-blend-screen opacity-30 bg-red-500/10 transform translate-x-1" />
      {/* Blue channel offset */}
      <div className="absolute inset-0 mix-blend-screen opacity-30 bg-blue-500/10 transform -translate-x-1" />
      {/* Green channel (no offset) */}
      <div className="absolute inset-0 mix-blend-screen opacity-20 bg-green-500/5" />
    </div>
  );
}
```

### CSS Animation
**File**: `src/styles/effects.css:35-40`
```css
@keyframes chromaticShift {
  0% { transform: translateX(0); }
  25% { transform: translateX(1px); }
  50% { transform: translateX(0); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
}
```

### CSS Classes
**File**: `src/styles/effects.css:130-140`
```css
.chromatic-aberration-overlay {
  mix-blend-mode: screen;
  animation: chromaticShift 0.5s ease-in-out infinite;
}

/* Mobile budget: disable chromatic aberration */
@media (max-width: 640px) {
  .chromatic-aberration-overlay {
    display: none;
  }
}
```

---

## 8. ATMOSPHERIC EFFECTS

### Grain Overlay
**File**: `src/styles/effects.css:143-147`
```css
.atmospheric-grain {
  opacity: 0.06;  /* Reduced from 0.25 for safe default */
  mix-blend-mode: overlay;
  animation: filmNoise 0.1s infinite;
}
```

### Film Noise
**File**: `src/styles/effects.css:149-152`
```css
.film-noise {
  opacity: 0.05;  /* Safe intensity for film noise */
  mix-blend-mode: overlay;
}
```

### Cinematic Lighting
**File**: `src/styles/effects.css:155-185`
```css
.cinematic-lighting::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      ellipse at 30% 20%,
      rgba(6, 182, 212, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 80%,
      rgba(139, 69, 19, 0.05) 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
  pointer-events: none;
  z-index: 1;
}
```

### Color Grading
**File**: `src/styles/effects.css:188-211`
```css
.color-grading {
  filter: 
    contrast(1.1)
    brightness(0.95)
    saturate(1.2)
    hue-rotate(5deg);
}

.color-grading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(
      45deg,
      rgba(6, 182, 212, 0.02) 0%,
      rgba(139, 69, 19, 0.02) 100%
    );
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

---

## 9. SCROLL NORMALIZATION & GOVERNANCE

### Hook Constants
**File**: `src/hooks/useScrollRotation.ts:9-14`
```javascript
// Constants for wheel normalization
const SENSITIVITY_DEG_PER_PX = 0.04; // Conservative sensitivity
const LINE_HEIGHT = 16; // Default line height in pixels
const MAX_DEG_PER_TICK = 2; // Max rotation per frame
const FRICTION = 0.94; // Stronger damping
```

### Wheel Normalization
**File**: `src/hooks/useScrollRotation.ts:52-62`
```javascript
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
```

### Governance Guard
**File**: `src/components/lab/EnhancedLabCarousel.tsx:287-320`
```javascript
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
```

---

## 10. EFFECT TOGGLES & DEFAULTS

### Default Effects Configuration
**File**: `src/components/lab/EnhancedLabCarousel.tsx:33-45`
```javascript
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
```

### DevPanel Toggle Handler
**File**: `src/components/dev/DevPanel.tsx:26-37`
```javascript
const toggleEffect = (effectName: keyof EffectSettings) => {
  // Guard against unknown keys
  if (!(effectName in effects)) {
    console.warn(`[DevPanel] Unknown effect key: ${effectName}`);
    return;
  }
  
  onEffectChange({
    ...effects,
    [effectName]: !effects[effectName]
  });
};
```

### Effect Groups Definition
**File**: `src/components/dev/DevPanel.tsx:39-71`
```javascript
const effectGroups = [
  { 
    title: 'Panel Style', 
    effects: [
      { key: 'monitorStyle', name: 'Monitor/Screen Style', description: 'Transform cards to monitor bezels' },
      { key: 'scanLines', name: 'Scan Lines', description: 'CRT-style scan line overlay' },
      { key: 'screenGlow', name: 'Screen Glow', description: 'Monitor screen glow effect' }
    ]
  },
  {
    title: "Color Effects", 
    effects: [
      { key: 'chromaticAberration', label: 'Chromatic Aberration', description: 'RGB color separation' },
      { key: 'colorGrading', label: 'Color Grading', description: 'Cinematic color treatment' }
    ]
  },
  {
    title: "Atmosphere",
    effects: [
      { key: 'enhancedWireframe', label: 'Enhanced Wireframe', description: 'Prominent central structure' },
      { key: 'atmosphericGrain', label: 'Atmospheric Grain', description: 'Film grain texture' },
      { key: 'filmNoise', label: 'Film Noise', description: 'Dynamic noise overlay' }
    ]
  },
  {
    title: "Lighting & Depth",
    effects: [
      { key: 'cinematicLighting', label: 'Cinematic Lighting', description: 'Dramatic lighting effects' },
      { key: 'depthOfField', label: 'Depth of Field', description: 'Focus blur effects' },
      { key: 'ghostBack', label: 'Ghost Back', description: 'Double-sided tiles with dim backside' }
    ]
  }
];
```

---

## 11. CSS VARIABLE PIPELINE

### Variable Definitions on Tile
**File**: `src/components/lab/EnhancedLabCarousel.tsx:517-523`
```javascript
const angleDeg = 360 / Math.max(projects.length, 1);
const tileVars = {
  '--tile-index': String(index),
  '--tile-angle': `${angleDeg}deg`,
  '--radius': `${radius}px`,
  '--global-rotation': `${rotation}deg`
};
```

### Dynamic Variables Set by JS
**File**: `src/components/lab/EnhancedLabCarousel.tsx:182,196,197,211,221,222,241,253`
```javascript
tile.style.setProperty('--d', depth.toFixed(3));          // Depth (0-1)
tile.style.setProperty('--tilt', tilt.toFixed(3));        // Legacy tilt
tile.style.setProperty('--scale', scale.toFixed(3));      // Legacy scale
tile.style.setProperty('--pop', pop.toFixed(1));          // Z-offset
tile.style.setProperty('--front-o', frontClamped.toFixed(3)); // Front opacity
tile.style.setProperty('--bias-scale', biasScale.toFixed(3)); // Bias scale
tile.style.setProperty('--bias-tilt-deg', biasTilt.toFixed(3)); // Bias tilt
tile.style.setProperty('--back', backFade.toFixed(3));    // Back fade (0-1)
tile.style.setProperty('--ghost-o', ghostOpacity.toFixed(3)); // Ghost opacity
```

### CSS Variable Usage
**File**: `src/styles/lab.css`
- `--track-tilt-deg`: Line 46
- `--bias-tilt-deg`: Line 58
- `--bias-scale`: Line 59
- `--pop`: Line 57
- `--d`: Lines 223, 250, 278, 281
- `--front-o`: Lines 225, 231, 236, 252, 258, 263
- `--tile-bg`: Line 310
- `--ghost-o`: Lines 317, 331
- `--panel-w`: Line 299
- `--panel-h`: Line 300

---

## 12. ENHANCED WIREFRAME CENTER

### Component Structure
**File**: `src/components/effects/EnhancedWireframe.tsx:25-55`
```jsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none enhanced-wireframe">
  {/* Central Hub */}
  <div className="relative w-48 h-48">
    {/* Outer Ring */}
    <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-full animate-pulse">
      <div className="absolute inset-2 border border-cyan-300/30 rounded-full" />
      <div className="absolute inset-4 border border-cyan-200/20 rounded-full" />
    </div>

    {/* Geometric Structure */}
    <div className="absolute inset-8">
      {/* Rotating hexagon */}
      <div className="absolute inset-0 border-2 border-cyan-500/50 transform rotate-0 animate-spin-slow">
        <div 
          className="w-full h-full"
          style={{
            clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
          }}
        />
      </div>
      
      {/* Counter-rotating triangle */}
      <div className="absolute inset-4 border border-cyan-400/40 transform rotate-0 animate-reverse-spin">
        <div 
          className="w-full h-full"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />
      </div>
    </div>
  </div>
</div>
```

### Conditional Rendering
**File**: `src/components/effects/EnhancedWireframe.tsx:20-24`
```jsx
export function EnhancedWireframe({ enabled = false }: EnhancedWireframeProps) {
  if (!enabled) return null;

  return (
    // ... wireframe structure
  );
}
```

---

## VERIFICATION STATUS

### Git Status Check
```bash
git status --porcelain
```
**Result**: Only untracked audit files, no source modifications

### File Structure
```
src/
├── components/
│   ├── lab/
│   │   ├── EnhancedLabCarousel.tsx (562 lines)
│   │   └── EnhancedLabTile.tsx (164 lines)
│   ├── dev/
│   │   └── DevPanel.tsx (168 lines)
│   └── effects/
│       ├── EffectLayers.tsx (102 lines)
│       └── EnhancedWireframe.tsx (121 lines)
├── hooks/
│   └── useScrollRotation.ts (106 lines)
├── styles/
│   ├── lab.css (347 lines)
│   └── effects.css (282 lines)
└── utils/
    └── carouselMath.ts
```

---

## QUESTIONS ANSWERED WITH CODE LOCATIONS

### 1. Wireframe Center Drawing
- **Selector**: `.enhanced-wireframe` at `src/components/effects/EnhancedWireframe.tsx:25`
- **Disable approach**: Conditional render via `enabled` prop (line 21)
- **Center elements**: Nested rings (lines 28-32), hexagon (lines 37-44), triangle (lines 47-53)

### 2. Center Logo Orientation
- **Billboard approach**: No rotation transform applied to logo element
- **Rotation sync approach**: Add `rotateY(var(--global-rotation))` to logo container
- **Variable location**: `--global-rotation` set at `src/components/lab/EnhancedLabCarousel.tsx:522`

### 3. Endless Feel Implementation
- **Current radius calculation**: `src/utils/carouselMath.ts`
- **Tile rendering**: `src/components/lab/EnhancedLabCarousel.tsx:515-541`
- **RepeatTurns increase**: Modify tile generation loop to add buffer tiles
- **Performance**: CSS variables handle transform, no JS recalculation needed

### 4. RGB Edge Configuration
- **Red offset**: `translate-x-1` at `src/components/effects/EffectLayers.tsx:50`
- **Blue offset**: `-translate-x-1` at line 52
- **Green center**: No transform at line 54
- **Opacity values**: Red/Blue at `opacity-30`, Green at `opacity-20`
- **Desktop-only gate**: `src/styles/effects.css:136-140`

### 5. Mobile Gating Status
- **Currently gated effects**:
  - Chromatic aberration: `src/components/lab/EnhancedLabCarousel.tsx:37`
  - Check: `isDesktop() = !window.matchMedia('(max-width: 640px)').matches`
- **Mobile-optimized values**:
  - DoF blur: 2px vs 4.5px (`src/styles/lab.css:250`)
  - Ghost opacity: 0.22 vs 0.28 (`src/components/lab/EnhancedLabCarousel.tsx:235`)
  - Front floor: 0.48 vs 0.42 (line 203)
- **Always enabled**: Ghost back, overlays, grain (with reduced opacity)