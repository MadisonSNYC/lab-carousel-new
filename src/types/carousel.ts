export interface LabProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  year: number;
  url?: string;
  technologies?: string[];
}

export interface CarouselConfig {
  panelCount: number;
  panelWidth: number;
  panelHeight: number;
  perspective: number;
  rotationSpeed: number;
  scrollSensitivity: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface CarouselState {
  currentRotation: number;
  activeIndex: number;
  isAnimating: boolean;
  isUserInteracting: boolean;
  reducedMotion: boolean;
}

export interface CarouselControls {
  rotate: (angle: number) => void;
  goToIndex: (index: number) => void;
  next: () => void;
  previous: () => void;
  pause: () => void;
  resume: () => void;
}

export interface EffectSettings {
  monitorStyle: boolean;
  scanLines: boolean;
  screenGlow: boolean;
  chromaticAberration: boolean;
  colorGrading: boolean;
  enhancedWireframe: boolean;
  atmosphericGrain: boolean;
  filmNoise: boolean;
  cinematicLighting: boolean;
  depthOfField: boolean;
}

