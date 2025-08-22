import React from 'react';
import { EffectSettings } from '../dev/DevPanel';

interface EffectLayersProps {
  effects: EffectSettings;
  children: React.ReactNode;
}

export function EffectLayers({ effects, children }: EffectLayersProps) {
  return (
    <div className="relative w-full h-full">
      {/* Main content */}
      <div 
        className={`
          relative w-full h-full
          ${effects.cinematicLighting ? 'cinematic-lighting' : ''}
          ${effects.colorGrading ? 'color-grading' : ''}
        `}
      >
        {children}
      </div>

      {/* Chromatic Aberration Overlay */}
      {effects.chromaticAberration && (
        <ChromaticAberrationOverlay />
      )}

      {/* Atmospheric Grain */}
      {effects.atmosphericGrain && (
        <AtmosphericGrainOverlay />
      )}

      {/* Film Noise */}
      {effects.filmNoise && (
        <FilmNoiseOverlay />
      )}

      {/* Depth of Field */}
      {effects.depthOfField && (
        <DepthOfFieldOverlay />
      )}
    </div>
  );
}

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

function AtmosphericGrainOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay atmospheric-grain"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px'
      }}
    />
  );
}

function FilmNoiseOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none film-noise">
      <div 
        className="w-full h-full opacity-15 mix-blend-overlay animate-pulse"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.02' numOctaves='3' result='noise' seed='1'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='%23ffffff'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          animation: 'filmNoise 0.1s infinite'
        }}
      />
    </div>
  );
}

function DepthOfFieldOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none depth-of-field">
      {/* Radial blur gradient */}
      <div 
        className="w-full h-full opacity-30"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)',
          backdropFilter: 'blur(0.5px)'
        }}
      />
    </div>
  );
}

