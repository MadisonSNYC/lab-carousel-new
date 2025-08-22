import React, { useState } from 'react';
import { LabProject } from '../../types/carousel';

interface LabTileProps {
  project: LabProject;
  index: number;
  isActive: boolean;
  transform: string;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function LabTile({ 
  project, 
  index, 
  isActive, 
  transform, 
  onClick, 
  onFocus, 
  onBlur 
}: LabTileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`
        lab-tile absolute w-72 h-48 cursor-pointer
        transition-all duration-300 ease-out
        ${isActive ? 'lab-tile--active' : ''}
      `}
      style={{ transform }}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View project: ${project.title}`}
      aria-describedby={`project-desc-${project.id}`}
    >
      <div className="
        relative w-full h-full 
        bg-gray-900/80 backdrop-blur-sm 
        border border-gray-700/50 
        rounded-lg overflow-hidden
        shadow-2xl
        hover:shadow-cyan-500/20 hover:border-cyan-500/30
        focus:shadow-cyan-500/30 focus:border-cyan-500/50
        focus:outline-none focus:ring-2 focus:ring-cyan-500/50
        transition-all duration-300
      ">
        {/* Image Container */}
        <div className="relative w-full h-2/3 overflow-hidden">
          {!imageError ? (
            <>
              <img
                src={project.imageUrl}
                alt={project.title}
                className={`
                  w-full h-full object-cover
                  transition-all duration-500
                  ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
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
                <p className="text-xs">Image unavailable</p>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="
              px-2 py-1 text-xs font-medium
              bg-cyan-500/20 text-cyan-300
              border border-cyan-500/30
              rounded-full backdrop-blur-sm
            ">
              {project.category}
            </span>
          </div>

          {/* Year Badge */}
          <div className="absolute top-3 right-3">
            <span className="
              px-2 py-1 text-xs font-medium
              bg-gray-900/60 text-gray-300
              border border-gray-600/50
              rounded-full backdrop-blur-sm
            ">
              {project.year}
            </span>
          </div>

          {/* Chromatic Aberration Effect */}
          <div className="
            absolute inset-0 pointer-events-none
            bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5
            mix-blend-screen
          " />
        </div>

        {/* Content Container */}
        <div className="p-4 h-1/3 flex flex-col justify-between">
          <div>
            <h3 className="
              text-lg font-semibold text-white mb-1
              line-clamp-1
            ">
              {project.title}
            </h3>
            <p 
              id={`project-desc-${project.id}`}
              className="
                text-sm text-gray-300 
                line-clamp-2 leading-relaxed
              "
            >
              {project.description}
            </p>
          </div>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="
                    px-2 py-0.5 text-xs
                    bg-gray-800/60 text-gray-400
                    border border-gray-700/50
                    rounded
                  "
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="
                  px-2 py-0.5 text-xs
                  text-gray-500
                ">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className="
          absolute inset-0 pointer-events-none
          bg-gradient-to-t from-cyan-500/0 via-cyan-500/0 to-cyan-500/0
          hover:from-cyan-500/5 hover:via-cyan-500/2 hover:to-cyan-500/5
          transition-all duration-300
        " />
      </div>
    </div>
  );
}

