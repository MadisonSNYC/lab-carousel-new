import React, { useState } from 'react';

export interface EffectSettings {
  monitorStyle: boolean;
  curvedPanels: boolean;
  chromaticAberration: boolean;
  scanLines: boolean;
  screenGlow: boolean;
  enhancedWireframe: boolean;
  atmosphericGrain: boolean;
  filmNoise: boolean;
  cinematicLighting: boolean;
  depthOfField: boolean;
  colorGrading: boolean;
}

interface DevPanelProps {
  effects: EffectSettings;
  onEffectChange: (effects: EffectSettings) => void;
  onReset: () => void;
}

export function DevPanel({ effects, onEffectChange, onReset }: DevPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const effectGroups = [
    { 
      title: 'Panel Style', 
      effects: [
        { key: 'monitorStyle', name: 'Monitor/Screen Style', description: 'Transform cards to monitor bezels' },
        { key: 'curvedPanels', name: 'Curved Panels', description: 'Add 3D curved panel effect' },
        { key: 'scanLines', name: 'Scan Lines', description: 'CRT-style scan line overlay' },
        { key: 'screenGlow', name: 'Screen Glow', description: 'Monitor screen glow effect' }
      ]
    },
    {
      title: "Color Effects", 
      effects: [
        { key: 'chromaticAberration' as const, label: 'Chromatic Aberration', description: 'RGB color separation' },
        { key: 'colorGrading' as const, label: 'Color Grading', description: 'Cinematic color treatment' }
      ]
    },
    {
      title: "Atmosphere",
      effects: [
        { key: 'enhancedWireframe' as const, label: 'Enhanced Wireframe', description: 'Prominent central structure' },
        { key: 'atmosphericGrain' as const, label: 'Atmospheric Grain', description: 'Film grain texture' },
        { key: 'filmNoise' as const, label: 'Film Noise', description: 'Dynamic noise overlay' }
      ]
    },
    {
      title: "Lighting & Depth",
      effects: [
        { key: 'cinematicLighting' as const, label: 'Cinematic Lighting', description: 'Dramatic lighting effects' },
        { key: 'depthOfField' as const, label: 'Depth of Field', description: 'Focus blur effects' }
      ]
    }
  ];

  if (isCollapsed) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded px-3 py-2 text-cyan-400 text-sm hover:bg-gray-800/90 transition-colors"
        >
          Show Dev Panel
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed top-0 right-0 h-full w-80 z-50 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 p-4 overflow-y-auto"
      style={{
        maxHeight: '100vh',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch'
      }}
      data-scroll-allow="true"
      onWheel={(e) => e.stopPropagation()} // Prevent scroll from affecting carousel
    >
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-cyan-400">🛠️ Effects Panel</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm hover:bg-red-500/30 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-gray-400 text-sm hover:bg-gray-600/50 transition-colors"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {effectGroups.map((group) => (
            <div key={group.title} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300 mb-3 border-b border-gray-600/30 pb-1">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.effects.map((effect) => (
                  <label 
                    key={effect.key}
                    className="flex items-start gap-3 cursor-pointer hover:bg-gray-700/30 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={effects[effect.key]}
                      onChange={() => toggleEffect(effect.key)}
                      className="mt-0.5 w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        {effect.name}
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed">
                        {effect.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 text-center">
            Active Effects: {Object.values(effects).filter(Boolean).length} / {Object.keys(effects).length}
          </div>
          <div className="text-xs text-gray-600 text-center mt-1">
            Press 'D' to toggle this panel
          </div>
        </div>
      </div>
    </div>
  );
};