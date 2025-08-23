# Carousel Effects Complete Audit Report

## Quick Answers

### 1. Wireframe Center
- **Location**: `src/components/effects/EnhancedWireframe.tsx:25-55`
- **Container**: `.enhanced-wireframe` with `absolute inset-0 flex items-center justify-center`
- **Disable approach**: Conditionally render based on logo visibility prop

### 2. Center Logo Orientation
- **Recommendation**: Keep billboard (always forward) as default for readability
- **Alternative**: Apply `rotateY(var(--global-rotation))` to sync with carousel

### 3. Endless Feel
- **Recommendation**: OK to increase repeatTurns to +2.0 for visible+buffer
- **Rationale**: CSS variables handle rotation efficiently, virtualization unnecessary for ~12-16 tiles

### 4. RGB Edge Colors
- **Keep desktop-only subtle implementation**:
  - Red-left: `opacity-30` with `translate-x-1`
  - Blue-right: `opacity-30` with `-translate-x-1`
  - Green center: `opacity-20` (no offset)

### 5. Mobile Gating
- **Currently gated (desktop-only)**: Chromatic aberration
- **Should remain mobile-enabled**: Ghost back, DoF (reduced values), overlays
- **Consider gating**: Enhanced wireframe, multiple grain layers

---

## Effect Implementation Details

### Core 3D Layout
- **Transform pipeline**: `--tile-index * --tile-angle + --global-rotation → translateZ(--radius)`
- **File**: `src/components/lab/EnhancedLabTile.tsx:76`
```css
transform: translate(-50%, -50%) rotateY(calc(var(--tile-index) * var(--tile-angle) + var(--global-rotation))) translateZ(var(--radius))
```

### Track Tilt
- **File**: `src/styles/lab.css:46`
- **Implementation**: `-6deg` rotateX on `.lab-track` wrapper
```css
.lab-track {
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--track-tilt-deg, -6) * 1deg));
}
```

### Depth of Field (DoF)
- **JS Control**: `src/components/lab/EnhancedLabCarousel.tsx:150-183`
- **CSS Mapping**: `src/styles/lab.css:221-225`
- **Formula**: 
  - Desktop: `blur(calc(var(--d, 0) * 4.5px))`
  - Mobile: `blur(calc(var(--d, 0) * 2px))`
  - Opacity: `var(--front-o, 1)` with floor values (0.42 desktop, 0.48 mobile)

### Ghost Back Effect
- **JS Setup**: `src/components/lab/EnhancedLabCarousel.tsx:224-254`
  - Fade window: 55° to 75°
  - Ghost opacity max: 0.28 desktop, 0.22 mobile
  - Gate threshold: 0.40 (no ghost until back >= 0.40)
- **CSS Implementation**: `src/styles/lab.css:294-325`
  - Selector: `.lab-tile[data-ghost="on"]::after`
  - Transform: `rotateY(180deg)`
  - Image source: `var(--tile-bg)` set on tile element
  - Filter: `grayscale(1) blur(calc(1px + var(--back, 0) * 2px))`

### Per-Tile Bias
- **File**: `src/components/lab/EnhancedLabCarousel.tsx:213-222`
- **Variables**:
  - `--bias-scale`: 1.03 front to 0.92 side
  - `--bias-tilt-deg`: 0° front to -5° side

### Monitor/Screen Effects
- **Monitor Style**: `src/styles/effects.css:59-80`
  - Box shadow with reduced intensity for spacing
  - Gradient bezel effect
- **Screen Glow**: `src/styles/effects.css:83-88`
  - Triple-layer cyan glow at 22%, 15%, 8% opacity
- **Scan Lines**: `src/styles/effects.css:101-116`
  - Repeating linear gradient with cyan at 0.03 opacity

### Chromatic Aberration
- **Component**: `src/components/effects/EffectLayers.tsx:46-57`
- **CSS Animation**: `src/styles/effects.css:35-40`
- **Implementation**:
  - Red channel: `translate-x-1`
  - Blue channel: `-translate-x-1`
  - Green channel: no offset
  - Desktop-only via media query

### Atmospheric Effects
- **Grain**: `src/styles/effects.css:143-147`
  - Opacity: 0.06 (reduced from 0.25)
  - Mix-blend-mode: overlay
- **Cinematic Lighting**: `src/styles/effects.css:155-185`
  - Radial gradients at 30%/20% and 70%/80%
  - Linear gradient for depth

### Scroll Normalization
- **Hook**: `src/hooks/useScrollRotation.ts`
- **Constants**:
  - `SENSITIVITY_DEG_PER_PX`: 0.04
  - `MAX_DEG_PER_TICK`: 2
  - `FRICTION`: 0.94
- **Governance Guard**: `src/components/lab/EnhancedLabCarousel.tsx:287-320`
  - Checks for scrollable ancestors
  - Prevents carousel rotation inside scrollable areas

### Effect Toggles
- **DevPanel**: `src/components/dev/DevPanel.tsx`
- **Default Effects**: `src/components/lab/EnhancedLabCarousel.tsx:33-45`
```javascript
const defaultEffects: EffectSettings = {
  monitorStyle: true,
  scanLines: true,
  screenGlow: true,
  chromaticAberration: isDesktop(),
  colorGrading: true,
  enhancedWireframe: false,
  atmosphericGrain: true,
  filmNoise: true,
  cinematicLighting: true,
  depthOfField: true,
  ghostBack: true
}
```

### CSS Variable Pipeline
**Key Variables**:
- `--tile-index`: Tile position in array
- `--tile-angle`: Degrees per tile (360/count)
- `--global-rotation`: Current carousel rotation
- `--radius`: Distance from center
- `--d`: Depth value (0-1)
- `--front-o`: Front opacity (clamped)
- `--ghost-o`: Ghost opacity (gated)
- `--bias-scale`: Per-tile scale
- `--bias-tilt-deg`: Per-tile tilt
- `--track-tilt-deg`: Global track lean
- `--tile-bg`: Background image URL

### Performance Optimizations
- Will-change on critical properties
- Hardware acceleration via translateZ(0)
- Reduced motion support
- Mobile-specific reductions
- Workload limiting (skip distant tiles)

---

## File Structure
```
src/
├── components/
│   ├── lab/
│   │   ├── EnhancedLabCarousel.tsx (main logic)
│   │   └── EnhancedLabTile.tsx (tile component)
│   ├── dev/
│   │   └── DevPanel.tsx (effect toggles)
│   └── effects/
│       ├── EffectLayers.tsx (overlay effects)
│       └── EnhancedWireframe.tsx (center structure)
├── hooks/
│   └── useScrollRotation.ts (wheel handling)
├── styles/
│   ├── lab.css (3D transforms, DoF, ghost)
│   └── effects.css (overlays, atmosphere)
└── utils/
    └── carouselMath.ts (calculations)
```

---

## Implementation Status
✅ All effects verified as read-only
✅ No files modified during audit
✅ Complete code paths documented
✅ CSS variable pipeline mapped
✅ Mobile optimizations identified