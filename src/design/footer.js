import React from 'react';

function Footer() {
  return (
    <footer className="py-8 border-t border-[#2a2a2a]">
      <div className="max-w-screen-xl mx-auto px-5 flex justify-between items-center">
        <div className="flex space-x-12">
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold text-white mb-1">6</span>
            <span className="text-sm text-[#b0b0b0] uppercase tracking-wider">Visualizations</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold text-white mb-1">27</span>
            <span className="text-sm text-[#b0b0b0] uppercase tracking-wider">EU Countries</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold text-white mb-1">1</span>
            <span className="text-sm text-[#b0b0b0] uppercase tracking-wider">Eurostat Source</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-3xl font-bold text-white mb-1">6</span>
            <span className="text-sm text-[#b0b0b0] uppercase tracking-wider">Tables</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/HammadAamir/Digitilization_DataVisualization" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 cursor-pointer transition-colors duration-300 hover:text-white"
          >
            <svg className="w-5 h-5 text-[#007bff]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-base font-semibold text-[#b0b0b0] uppercase tracking-wider">CODE</span>
          </a>
          <a 
            href="https://ec.europa.eu/eurostat/web/digital-economy-and-society/database" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 cursor-pointer transition-colors duration-300 hover:text-white"
          >
            <svg className="w-5 h-5 text-[#4ecdc4]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
            <span className="text-base font-semibold text-[#b0b0b0] uppercase tracking-wider">DATASET</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export { Footer }; // Changed to named export