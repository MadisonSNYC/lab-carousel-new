import { useState } from 'react'
import { EnhancedLabCarousel } from './components/lab/EnhancedLabCarousel'
import { labProjects } from './data/labProjects'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import './styles/lab.css'
import './styles/effects.css'

function App() {
  const [selectedProject, setSelectedProject] = useState(null)

  const handleProjectSelect = (project) => {
    setSelectedProject(project)
    if (import.meta.env?.DEV) {
      console.log('Selected project:', project)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <EnhancedLabCarousel 
          projects={labProjects}
          onProjectSelect={handleProjectSelect}
          config={{
            autoRotate: true,
            autoRotateSpeed: 180,
            scrollSensitivity: 0.3
          }}
        />
      </ErrorBoundary>
      
      {selectedProject && (
        <div className="fixed top-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-sm z-40">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            {selectedProject.title}
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            {selectedProject.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{selectedProject.category}</span>
            <span>{selectedProject.year}</span>
          </div>
          <button 
            onClick={() => setSelectedProject(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default App
