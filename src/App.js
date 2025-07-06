// App.jsx
import React from 'react';
import { Header } from './design/header';
import { Hero } from './design/hero';
import { Footer } from './design/footer';
import { Categories } from './design/categories';
import { ChoroplethMap } from './components/choropleth'; // Import the new ChoroplethMap component
import { EnterpriseRevenue } from './components/enterpriserevenue';
import { BubbleChart } from './components/bubblechart';
import { DivergingBarChart } from './components/divergingbarchart';
import { PopulationPyramid } from './components/populationpyramid';
import SankeyDiagram from './components/sankeydiagram';

function App() {
  return (
    <div className="font-inter bg-[#121212] text-[#f0f0f0] leading-relaxed flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Footer />
      <Categories />
      {/* New Choropleth Map Section */}
      <section id="choropleth-section" className="bg-[#1a1a1a] py-24 text-center"> {/* Changed bg-dark-bg to bg-[#1a1a1a] for consistency */}
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Data Insights</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Internet Access Level - Households</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This choropleth map visualizes the percentage of households with internet access across different European countries. We aim to identify regions with high and low internet penetration, highlighting potential digital divides.
          </p>

          {/* The Chart */}
          <ChoroplethMap />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center"> {/* Changed max-w-3xl to max-w-screen-xl and text-left to text-center */}
            **Chart Analysis:** Upon examining the map, we can observe distinct patterns in internet access. Countries shaded in darker tones indicate higher levels of household internet penetration, while lighter shades suggest lower access. This visualization helps in understanding the digital infrastructure disparities across the continent and can inform policy decisions aimed at bridging the digital gap. Further analysis would involve correlating these access levels with socio-economic factors or urban-rural divides to gain deeper insights.
          </p>
        </div>
      </section>

      {/* Population Pyramid Section */}
      <section id="population-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Demographic Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Daily Internet Usage by Gender and Age Groups</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This population pyramid visualizes daily internet usage patterns across different age groups and genders, allowing us to identify demographic variations in digital adoption. We aim to understand how age and gender influence internet usage patterns and identify potential digital divides within populations.
          </p>

          {/* The Chart */}
          <PopulationPyramid />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The population pyramid reveals clear demographic patterns in daily internet usage across Europe. Younger age groups (16-34 years) consistently show the highest usage rates, often exceeding 95%, indicating that digital natives have fully embraced online connectivity. Usage rates gradually decline with age, with the 65-74 age group showing the lowest adoption rates, typically around 60-70%. Gender differences are generally minimal in younger age groups, but become more pronounced in older demographics, where women often show slightly higher usage rates than men. The chart also highlights the success of digital inclusion efforts in most European countries, with even the oldest age groups achieving significant internet adoption. However, the persistent gap between younger and older users suggests ongoing challenges in digital literacy and accessibility for senior populations. These insights are crucial for designing targeted digital inclusion programs that address age-specific barriers and ensure equitable access to digital services across all demographic groups.
          </p>
        </div>
      </section>

      {/* Enterprise Revenue Chart Section */}
      <section id="revenue-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Revenue Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Enterprise E-commerce Revenue Evolution</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This interactive chart tracks the evolution of e-commerce revenue share in European enterprises over time. We aim to identify which countries have shown the most significant growth in digital commerce adoption and understand the temporal patterns of digital transformation across different European economies.
          </p>

          {/* The Chart */}
          <EnterpriseRevenue />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The chart reveals significant variations in e-commerce adoption across European enterprises. Countries like Ireland, Belgium, and Czechia demonstrate consistently high e-commerce revenue shares, often exceeding 30%, indicating mature digital commerce ecosystems. In contrast, nations such as Greece, Bulgaria, and Estonia show lower adoption rates, typically staying below 10%, suggesting potential barriers to digital transformation. The data also shows notable volatility in some countries, with France and Germany experiencing periods of growth followed by declines, possibly reflecting market saturation or shifts in business strategies. Ireland's sharp peak in 2020, likely driven by pandemic-induced digital acceleration, followed by subsequent decline, highlights the dynamic nature of e-commerce adoption. These patterns underscore the importance of understanding regional disparities in digital infrastructure and policy support for successful e-commerce integration.
          </p>
        </div>
      </section>
      {/* Bubble Chart Section */}
      <section id="bubble-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Correlation Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Digital Commerce Ecosystem Correlations</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This bubble chart explores the relationships between three key digital commerce indicators: online buyers, enterprises with online orders, and e-commerce turnover. We aim to identify which countries have achieved balanced digital commerce ecosystems and understand the interdependencies between consumer adoption and business digitalization.
          </p>

          {/* The Chart */}
          <BubbleChart />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The bubble chart reveals fascinating correlations between consumer and business digital adoption patterns. Countries with larger bubbles (higher e-commerce turnover) and positioned in the upper-right quadrant demonstrate strong alignment between consumer online behavior and business digitalization. Nations like Denmark, Netherlands, and Sweden show high values across all three metrics, indicating mature digital commerce ecosystems where both consumers and businesses have embraced online channels. Countries with smaller bubbles in the lower-left quadrant, such as Bulgaria and Romania, suggest nascent digital commerce environments where both consumer adoption and business digitalization are still developing. The chart also highlights countries with imbalanced development - some have high consumer adoption but lower business digitalization, or vice versa. These insights are crucial for policymakers and businesses to understand where targeted interventions could accelerate digital transformation and create more balanced digital commerce ecosystems.
          </p>
        </div>
      </section>
      {/* Diverging Bar Chart Section */}
      <section id="diverging-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Digital Exclusion Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Digital Exclusion: Internet Non-Usage Patterns</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This diverging bar chart examines the percentage of individuals who have never used the internet, comparing each country's rate against the EU average. We aim to identify digital exclusion hotspots and understand which regions require targeted digital inclusion initiatives to bridge the digital divide.
          </p>

          {/* The Chart */}
          <DivergingBarChart />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The diverging bar chart reveals stark disparities in digital exclusion across Europe. Countries with red bars extending to the right (above EU average) represent areas of concern where digital exclusion is higher than the European norm. Nations like Bulgaria, Romania, and Greece show significantly higher rates of internet non-usage, indicating potential barriers such as limited infrastructure, economic constraints, or demographic factors. Conversely, countries with blue bars extending to the left (below EU average) demonstrate better digital inclusion, with nations like Denmark, Netherlands, and Sweden showing minimal digital exclusion. The EU average serves as a crucial benchmark, highlighting that while some countries have achieved near-universal digital access, others still face significant challenges in ensuring basic internet connectivity for their populations. These findings are essential for policymakers to prioritize digital infrastructure investments and targeted inclusion programs in regions with the highest digital exclusion rates.
          </p>
        </div>
      </section>
      {/* Sankey Diagram Section */}
      <section id="sankey-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Flow Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Digital Activity Flow by Age Group</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This Sankey diagram visualizes the flow of digital activities across different age groups, showing how various online activities are distributed among different demographic segments. We aim to understand age-based patterns in digital behavior and identify which activities are most popular among different age groups.
          </p>

          {/* The Chart */}
          <SankeyDiagram />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The Sankey diagram reveals clear age-based patterns in digital activity preferences. Younger age groups (16-24 and 25-34) show the highest engagement across all digital activities, with particularly strong flows to social media and email usage. The flow to online courses is notably lower across all age groups, suggesting that while basic digital communication tools are widely adopted, educational digital platforms may require more targeted promotion. As age increases, there's a consistent decline in digital activity flows, with the 65-74 age group showing the lowest engagement levels. However, even among older age groups, email remains the most accessible digital activity, indicating that basic communication tools are more universally adopted than more complex digital services. These insights are valuable for designing age-appropriate digital inclusion programs and understanding which digital services require targeted support for different demographic groups.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App