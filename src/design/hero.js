import React, { useState, useEffect } from 'react';

function Hero() {
  const [activeSection, setActiveSection] = useState(0);

  const timelineItems = [
    { id: 0, icon: "🗺️", label: "Choropleth", section: "choropleth-section" },
    { id: 1, icon: "📊", label: "Population", section: "population-section" },
    { id: 2, icon: "💰", label: "Revenue", section: "revenue-section" },
    { id: 3, icon: "🫧", label: "Bubble", section: "bubble-section" },
    { id: 4, icon: "📈", label: "Diverging", section: "diverging-section" },
    { id: 5, icon: "🌊", label: "Sankey", section: "sankey-section" }
  ];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = timelineItems.map(item => document.getElementById(item.section));
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTimelineClick = (id) => {
    setActiveSection(id);
    const element = document.getElementById(timelineItems[id].section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Timeline Sidebar */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col items-center space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#4a90e2] via-[#45b7d1] to-[#4ecdc4] opacity-60"></div>
          
          {timelineItems.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Timeline Dot */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-[#4a90e2] text-white scale-110 shadow-lg shadow-[#4a90e2]/50' 
                    : 'bg-[#2a2a2a] text-[#b0b0b0] hover:bg-[#4a90e2] hover:text-white hover:scale-105'
                }`}
                onClick={() => handleTimelineClick(item.id)}
                onMouseEnter={() => setActiveSection(item.id)}
              >
                {item.icon}
              </div>
              
              {/* Label - More Subtle */}
              <div className={`absolute left-14 top-1/2 transform -translate-y-1/2 whitespace-nowrap transition-all duration-300 ${
                activeSection === item.id 
                  ? 'opacity-70 translate-x-0' 
                  : 'opacity-0 translate-x-2'
              }`}>
                <div className="bg-[#1a1a1a]/80 text-white px-2 py-1 rounded text-xs font-medium border border-[#4a90e2]/50 backdrop-blur-sm">
                  {item.label}
                </div>
              </div>
              
              {/* Connection Line */}
              <div className={`absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-0.5 transition-all duration-300 ${
                activeSection === item.id 
                  ? 'bg-[#4a90e2]' 
                  : 'bg-[#555]'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

    <main className="flex-grow relative overflow-hidden py-20 flex items-center">
      <div className="max-w-screen-xl mx-auto px-5 flex justify-between items-center relative z-10">
          <div className="max-w-2xl z-20">
          <h1 className="text-6xl font-bold text-white leading-tight mb-5">
              European Digitalization <span className="text-2xl font-medium text-[#b0b0b0] bg-[#2a2a2a] px-2.5 py-1 rounded align-middle ml-4">Data Visualization</span>
          </h1>
          <p className="text-lg text-[#b0b0b0] leading-relaxed mb-10">
              Interactive visualizations exploring digital transformation trends <br />across European countries and demographics.
          </p>
          <div className="flex space-x-4">
              <div className="px-8 py-3.5 border-none rounded-lg text-base font-semibold bg-[#007bff] text-white flex items-center justify-center">
                <span>Name</span>
              </div>
              <div className="px-8 py-3.5 bg-transparent text-white border border-[#555] rounded-lg text-base font-semibold flex items-center justify-center">
                <span>ID</span>
              </div>
            </div>
          </div>
          
          {/* 3D Rotating World Map and Globe */}
          <div className="relative w-96 h-96 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a1a1a] to-[#1a1a1a] z-10"></div>
            
            {/* First Globe - World Map */}
            <div className="relative w-96 h-96 animate-spin-slow">
              {/* World Map SVG with 3D effect */}
              <svg 
                viewBox="0 0 1000 500" 
                className="w-full h-full opacity-60 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(74, 144, 226, 0.3))',
                  transform: 'perspective(1000px) rotateY(15deg) rotateX(10deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Simplified World Map Paths */}
                <g fill="#4a90e2" stroke="#2a2a2a" strokeWidth="0.5">
                  {/* Europe */}
                  <path d="M450 150 L480 140 L500 150 L520 160 L540 170 L550 180 L560 190 L570 200 L580 210 L590 220 L600 230 L610 240 L620 250 L630 260 L640 270 L650 280 L660 290 L670 300 L680 310 L690 320 L700 330 L710 340 L720 350 L730 360 L740 370 L750 380 L760 390 L770 400 L780 410 L790 420 L800 430 L810 440 L820 450 L830 460 L840 470 L850 480 L860 490 L870 500 L880 510 L890 520 L900 530 L910 540 L920 550 L930 560 L940 570 L950 580 L960 590 L970 600 L980 610 L990 620 L1000 630" />
                  {/* North America */}
                  <path d="M100 200 L120 190 L140 180 L160 170 L180 160 L200 150 L220 140 L240 130 L260 120 L280 110 L300 100 L320 90 L340 80 L360 70 L380 60 L400 50 L420 40 L440 30 L460 20 L480 10 L500 0 L520 10 L540 20 L560 30 L580 40 L600 50 L620 60 L640 70 L660 80 L680 90 L700 100 L720 110 L740 120 L760 130 L780 140 L800 150 L820 160 L840 170 L860 180 L880 190 L900 200 L920 210 L940 220 L960 230 L980 240 L1000 250" />
                  {/* Asia */}
                  <path d="M800 100 L820 90 L840 80 L860 70 L880 60 L900 50 L920 40 L940 30 L960 20 L980 10 L1000 0 L1000 50 L1000 100 L1000 150 L1000 200 L1000 250 L1000 300 L1000 350 L1000 400 L1000 450 L1000 500" />
                  {/* Africa */}
                  <path d="M500 200 L520 210 L540 220 L560 230 L580 240 L600 250 L620 260 L640 270 L660 280 L680 290 L700 300 L720 310 L740 320 L760 330 L780 340 L800 350 L820 360 L840 370 L860 380 L880 390 L900 400 L920 410 L940 420 L960 430 L980 440 L1000 450" />
                  {/* South America */}
                  <path d="M200 300 L220 310 L240 320 L260 330 L280 340 L300 350 L320 360 L340 370 L360 380 L380 390 L400 400 L420 410 L440 420 L460 430 L480 440 L500 450 L520 460 L540 470 L560 480 L580 490 L600 500" />
                </g>
                
                {/* Highlight Europe */}
                <g fill="#ff6b6b" opacity="0.8">
                  <path d="M450 150 L480 140 L500 150 L520 160 L540 170 L550 180 L560 190 L570 200 L580 210 L590 220 L600 230 L610 240 L620 250 L630 260 L640 270 L650 280 L660 290 L670 300 L680 310 L690 320 L700 330 L710 340 L720 350 L730 360 L740 370 L750 380 L760 390 L770 400 L780 410 L790 420 L800 430 L810 440 L820 450 L830 460 L840 470 L850 480 L860 490 L870 500 L880 510 L890 520 L900 530 L910 540 L920 550 L930 560 L940 570 L950 580 L960 590 L970 600 L980 610 L990 620 L1000 630" />
                </g>
              </svg>
            </div>
            
            {/* Second Globe - 3D Sphere */}
            <div className="absolute w-96 h-96 animate-spin-reverse" style={{top: '0%', right: '0%'}}>
              <div 
                className="w-full h-full rounded-full bg-gradient-to-br from-[#4a90e2] via-[#45b7d1] to-[#4ecdc4] opacity-30"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #4a90e2 0%, #45b7d1 40%, #4ecdc4 70%, #2a2a2a 100%)',
                  filter: 'drop-shadow(0 0 30px rgba(74, 144, 226, 0.4))',
                  transform: 'perspective(800px) rotateY(25deg) rotateX(15deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Grid lines for 3D effect */}
                <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#grid)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </svg>
              </div>
            </div>
            
            {/* Floating data points */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#4a90e2] rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#ff6b6b] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-[#4ecdc4] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-[#45b7d1] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>
      </div>
    </main>
      
      {/* Add custom animations for slow rotation */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotateY(0deg) rotateX(15deg);
          }
          to {
            transform: rotateY(360deg) rotateX(15deg);
          }
        }
        @keyframes spin-reverse {
          from {
            transform: rotateY(360deg) rotateX(-10deg) rotateZ(5deg);
          }
          to {
            transform: rotateY(0deg) rotateX(-10deg) rotateZ(5deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
      `}</style>
    </>
  );
}

export { Hero }; // Changed to named export