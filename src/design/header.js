import React from 'react';

function Header() {
  return (
    <header className="py-5 relative z-50">
      <div className="max-w-screen-xl mx-auto px-5 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#f0f0f0]">Digitilization</div>
        <nav className="flex space-x-10">
          <a href="#" className="text-[#b0b0b0] no-underline text-sm font-medium tracking-wider transition-colors duration-300 hover:text-white">CHARTS</a>
          <a href="#" className="text-[#b0b0b0] no-underline text-sm font-medium tracking-wider transition-colors duration-300 hover:text-white">DATA</a>
        </nav>
      </div>
    </header>
  );
}

export { Header }; // Changed to named export