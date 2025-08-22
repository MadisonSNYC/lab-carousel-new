/**
 * Calculate the radius for a cylindrical carousel based on panel width and count
 * Uses the proven approach from the other chat with min/max bounds
 * Optimized for small fixed-size cards
 */
export function calculateCarouselRadius(panelWidth: number, panelCount: number): number {
  if (panelCount < 3) return 400;
  const r = (panelWidth / 2) / Math.tan(Math.PI / panelCount);
  // Optimized range for small cards to show multiple panels
  return Math.max(300, Math.min(800, r * 1.2)); // Moderate radius for good visibility
}

/**
 * Calculate the angle for each panel in the carousel
 */
export function calculatePanelAngle(index: number, panelCount: number): number {
  return (360 / panelCount) * index;
}

/**
 * Convert scroll delta to rotation angle based on sensitivity
 */
export function scrollToRotation(scrollDelta: number, sensitivity: number = 0.5): number {
  return scrollDelta * sensitivity;
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate the closest panel index based on current rotation
 */
export function getClosestPanelIndex(rotation: number, panelCount: number): number {
  const normalizedRotation = normalizeAngle(rotation);
  const anglePerPanel = 360 / panelCount;
  return Math.round(normalizedRotation / anglePerPanel) % panelCount;
}

/**
 * Calculate transform string for a panel at given index and rotation for TRUE CYLINDER
 * Modified to work with container-level rotation - only apply static positioning
 */
export function calculatePanelTransform(
  index: number, 
  panelCount: number, 
  radius: number, 
  globalRotation: number = 0
): string {
  // Calculate the static angle for this panel's position in the cylinder
  const angle = calculatePanelAngle(index, panelCount);
  
  // Only apply static positioning - container handles rotation
  // This prevents double-rotation during scroll
  return `rotateY(${angle}deg) translateZ(${radius}px)`;
}

/**
 * Calculate easing function for smooth animations
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

