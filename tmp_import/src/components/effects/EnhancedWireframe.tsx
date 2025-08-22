import React from 'react';

interface EnhancedWireframeProps {
  enabled: boolean;
}

export function EnhancedWireframe({ enabled }: EnhancedWireframeProps) {
  if (!enabled) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-32 h-32">
          {/* Simple wireframe lines */}
          <div className="absolute inset-0 border border-cyan-500/20 rotate-45" />
          <div className="absolute inset-2 border border-cyan-500/15 rotate-12" />
          <div className="absolute inset-4 border border-cyan-500/10" />
          
          {/* Central dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 bg-cyan-500/30 rounded-full" />
        </div>
      </div>
    );
  }

  return (
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

        {/* Radial Lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gradient-to-r from-cyan-500/60 to-transparent transform -translate-y-0.5 origin-left"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(24px)`
            }}
          />
        ))}

        {/* Central Core */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4">
          <div className="w-full h-full bg-cyan-500/50 rounded-full animate-pulse" />
          <div className="absolute inset-1 bg-cyan-400/70 rounded-full" />
          <div className="absolute inset-2 bg-cyan-300/90 rounded-full animate-ping" />
        </div>

        {/* Data Streams */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute top-1/2 left-1/2 w-1 h-16 transform -translate-x-0.5 -translate-y-8 origin-bottom animate-pulse"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-40px)`,
              background: 'linear-gradient(to top, rgba(6, 182, 212, 0.6), transparent)',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}

        {/* Corner Anchors */}
        {[
          { x: -24, y: -24 },
          { x: 24, y: -24 },
          { x: 24, y: 24 },
          { x: -24, y: 24 }
        ].map((pos, i) => (
          <div
            key={`anchor-${i}`}
            className="absolute w-3 h-3 border border-cyan-400/60 transform -translate-x-1.5 -translate-y-1.5"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`
            }}
          >
            <div className="absolute inset-0.5 bg-cyan-500/40 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Orbital Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`orbital-${i}`}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400/60 rounded-full transform -translate-x-1 -translate-y-1"
            style={{
              animation: `orbit ${3 + i}s linear infinite`,
              transformOrigin: `${80 + i * 20}px 0px`
            }}
          />
        ))}
      </div>
    </div>
  );
}

