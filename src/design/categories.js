import React from 'react';

function Categories() {
  return (
    <section className="bg-[#1a1a1a] py-16 text-center">
      <div className="max-w-screen-xl mx-auto px-5">
        <div className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">VISUALIZATION TYPES</div>
        <h2 className="text-4xl font-bold text-white mb-5 leading-tight">Interactive data visualizations for digital transformation insights</h2>
        <p className="text-lg text-[#b0b0b0] mb-8 max-w-2xl mx-auto">
          Explore European digitalization trends through multiple chart types, <br />from geographic distributions to demographic patterns.
        </p>
        
        <div className="bg-[#2a2a2a] rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-3">Dataset Overview</h3>
          <p className="text-[#b0b0b0] leading-relaxed">
            Our data from Eurostat shows internet usage in European countries over the years. 
            It includes information about internet access, online shopping, and how different age groups use the internet. 
            This helps us see how digital technology has changed across Europe.
          </p>
          </div>

        <div className="grid grid-cols-7 gap-6 max-w-3xl mx-auto">
          {/* Choropleth (Map) */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] stroke-current stroke-[1.5] hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          {/* Bar Chart */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] stroke-current stroke-[1.5] hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
                <path d="M10 20V4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 20V12" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 20V8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20V16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          {/* Line Chart */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] stroke-current stroke-[1.5] hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <path d="M2 13L8 6L14 12L22 4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="6" r="1.5" fill="#4a90e2" />
            <circle cx="14" cy="12" r="1.5" fill="#4a90e2" />
            <circle cx="22" cy="4" r="1.5" fill="#4a90e2" />
            <circle cx="2" cy="13" r="1.5" fill="#4a90e2" />
          </svg>
          {/* Bubble Chart */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] fill-current hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <circle cx="8" cy="8" r="3" fill="#ff6b6b"/>
            <circle cx="16" cy="12" r="4" fill="#4ecdc4"/>
            <circle cx="12" cy="18" r="2" fill="#45b7d1"/>
          </svg>
          {/* Diverging Bar Chart */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] stroke-current stroke-[1.5] hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <rect x="2" y="10" width="8" height="4" fill="#4a90e2"/>
            <rect x="14" y="10" width="8" height="4" fill="#ff6b6b"/>
            <rect x="11" y="8" width="2" height="8" fill="#888"/>
          </svg>
          {/* Population Pyramid */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] fill-current hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <rect x="6" y="4" width="4" height="16" fill="#4a90e2"/>
            <rect x="14" y="4" width="4" height="16" fill="#ff6b6b"/>
              </svg>
          {/* Sankey Diagram */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#f0f0f0] stroke-current stroke-[1.5] hover:text-[#4a90e2] transition-colors duration-200 cursor-pointer">
            <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12h18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 3v18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 3v18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
        </div>
      </div>
    </section>
  );
}

export { Categories };