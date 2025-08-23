import React, { useState } from 'react';
import { LabProject, EffectSettings } from '../../types/carousel';

interface EnhancedLabTileProps {
  project: LabProject;
  index: number;
  transform: string;
  isActive: boolean;
  effects: EffectSettings;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Fallback placeholder image (data URL for a simple gradient)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjxwYXRoIGQ9Ik0wIDBoNDAwdjMwMEgweiIgZmlsbD0idXJsKCNhKSIgb3BhY2l0eT0iLjMiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwNmI2ZDQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=';

export function EnhancedLabTile({ 
  project, 
  index, 
  transform, 
  isActive, 
  effects, 
  onClick,
  style 
}: EnhancedLabTileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(project.imageUrl);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => {
    setImageError(true);
    setImageSrc(PLACEHOLDER_IMAGE);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Dynamic classes based on effects
  const tileClasses = [
    'lab-tile absolute cursor-pointer transition-all duration-300 ease-out',
    'w-30 h-50', // Small fixed size (120px x 200px)
    isActive ? 'lab-tile--active' : '',
    effects.screenGlow ? 'screen-glow' : ''
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'relative w-full h-full transition-all duration-300',
    effects.monitorStyle ? 'monitor-style' : '',
    effects.colorGrading ? 'color-grading' : '',
    effects.cinematicLighting ? 'cinematic-lighting' : '',
    effects.depthOfField ? 'depth-of-field' : '',
    'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
    'border border-gray-700/50',
    'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10',
    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
    'overflow-hidden'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={tileClasses}
      style={{
        ...style, // CSS variables from parent
        // Use CSS variables for transform instead of inline transform
        transform: 'translate(-50%, -50%) rotateY(calc(var(--tile-index) * var(--tile-angle) + var(--global-rotation))) translateZ(var(--radius))',
        position: 'absolute',
        top: '50%',
        left: '50%',
        // Set image URL as CSS variable for ghost back effect
        '--tile-bg': `url("${imageSrc}")`,
        '--panel-w': '120px',
        '--panel-h': '200px'
      } as React.CSSProperties}
      data-ghost={effects.ghostBack ? 'on' : 'off'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Project: ${project.title}`}
      aria-describedby={`project-desc-${project.id}`}
    >
      <div className="tile-content w-full h-full">
        <div className={containerClasses}>
          {effects.monitorStyle && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900">
              <div className="absolute inset-2 bg-black overflow-hidden" />
            </div>
          )}

          <div className={effects.monitorStyle ? 'absolute inset-2 overflow-hidden' : 'w-full h-4/5 relative overflow-hidden'}>
            {!imageError ? (
              <>
                <img
                  src={imageSrc}
                  alt={project.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} ${effects.scanLines ? 'scan-lines' : ''}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                  decoding="async"
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs">Image unavailable</div>
                </div>
              </div>
            )}
          </div>

          <div className={effects.monitorStyle ? 'absolute top-1 left-1' : 'absolute top-2 left-2'}>
            <span className={`px-2 py-1 text-xs font-medium backdrop-blur-sm ${effects.monitorStyle ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
              {project.category}
            </span>
          </div>

          <div className={effects.monitorStyle ? 'absolute top-1 right-1' : 'absolute top-2 right-2'}>
            <span className={`px-2 py-1 text-xs font-medium backdrop-blur-sm ${effects.monitorStyle ? 'bg-gray-800/80 text-gray-200 border border-gray-600/50' : 'bg-gray-900/60 text-gray-300 border border-gray-600/50'}`}>
              {project.year}
            </span>
          </div>

          {effects.scanLines && (
            <div className="absolute inset-0 pointer-events-none scan-lines-overlay" />
          )}

          {!effects.monitorStyle && (
            <div className="p-2 h-1/5 flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-white text-center line-clamp-2">
                {project.title}
              </h3>
            </div>
          )}

          {effects.screenGlow && (
            <div className="absolute inset-0 pointer-events-none screen-glow-effect" />
          )}
        </div>
      </div>
    </div>
  );
}
