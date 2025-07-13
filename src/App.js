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
import { RadarChart } from './components/radarchart';

function App() {
  return (
    <div className="font-inter bg-[#121212] text-[#f0f0f0] leading-relaxed flex flex-col min-h-screen">
      <Header />
      <Hero />
      <Footer />
      <Categories />
      {/* Choropleth Map Section */}
      <section id="choropleth-section" className="bg-[#1a1a1a] py-24 text-center">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Geographic Analysis</p>

          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Household Internet Access Across Europe (2013-2024)</h2>

          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This interactive choropleth map visualizes internet access percentages across 50 European countries over 12 years. Use the year selector to explore temporal changes, hover over countries to see exact percentages, and observe the color gradient - darker blues indicate higher access rates. The legend shows the percentage scale from 50% to 100%.
          </p>

          {/* The Chart */}
          <ChoroplethMap />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The choropleth map shows clear patterns in Europe's digital development from 2013 to 2024. Eastern European countries have made significant progress, with Türkiye improving from 49.1% to 96.5%, Bulgaria from 53.7% to 92.1%, and Romania from 58.1% to 94.6%. Northern Europe maintains the highest access rates at 97% in 2024, followed by Western Europe at 95.8%, while Eastern Europe has caught up to 92.8%. The Netherlands and Luxembourg lead in 2024 with 99% and 98.8% respectively, while countries lagging behind include Bosnia and Herzegovina at 84.2%, Montenegro at 84.5%, Greece at 86.9%, Croatia at 88.4%, and Serbia at 88.8%. A clear North-South divide can be observed, though the gap has narrowed considerably over the 11-year period. The data reveals that rapid digital transformation is achievable, as demonstrated by Eastern Europe's convergence with Western standards. While some Balkan countries continue to lag behind, the overall trend shows positive progress toward universal internet access across the continent.
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
            This population pyramid visualizes daily internet usage patterns across different age groups and genders. The left side shows male data, right side shows female data. Bars extending outward indicate higher usage rates. Hover over bars to see exact percentages, use the play button to animate through years, and observe how usage patterns change with age - younger groups typically show higher adoption rates than older demographics.
          </p>

          {/* The Chart */}
          <PopulationPyramid />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The population pyramid reveals clear demographic patterns in daily internet usage across Europe. Younger age groups (16-34 years) consistently show the highest usage rates, often exceeding 95%, indicating that digital natives have fully embraced online connectivity. Usage rates gradually decline with age, with the 65-74 age group showing the lowest adoption rates, typically around 60-70%. Gender differences are generally minimal in younger age groups, but become more pronounced in older demographics, where women often show slightly higher usage rates than men. The chart also highlights the success of digital inclusion efforts in most European countries, with even the oldest age groups achieving significant internet adoption. 
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
          <p className="text-lg text-[#b0b0b0] mt-64 max-w-screen-xl mx-auto text-center">
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
      {/* Radar Chart Section */}
      <section id="radar-section" className="bg-[#1a1a1a] py-24 text-center border-t border-[#2a2a2a]">
        <div className="max-w-screen-xl mx-auto px-5">
          {/* Small Heading */}
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2.5">Activity Profile Analysis</p>
          {/* Main Chart Heading */}
          <h2 className="text-5xl font-bold text-white mb-5 leading-tight">Internet Activities by Age Group (Belgium, 2024)</h2>
          {/* Paragraph explaining the chart */}
          <p className="text-lg text-[#b0b0b0] mb-16 max-w-2xl mx-auto">
            This radar area chart visualizes the distribution of various internet activities among different age groups in Belgium for 2024. Each axis represents a digital activity, and each colored area corresponds to an age group. Hover over points to see exact percentages for each activity and age group.
          </p>
          {/* The Chart */}
          <RadarChart />

          {/* Chart Analysis */}
          <p className="text-lg text-[#b0b0b0] mt-16 max-w-screen-xl mx-auto text-center">
            The radar chart highlights distinct patterns in internet activity participation across age groups in Belgium for 2024. Younger age groups (16-24 and 25-34) show consistently high engagement in activities such as social media, email, and internet banking, reflecting their digital fluency and integration of the internet into daily life. Middle-aged groups (35-44 and 45-54) maintain strong participation, especially in practical activities like internet banking and email, but show a slight decline in social media and online learning. The oldest age groups (55-64 and 65-74) exhibit the lowest engagement across most activities, with email remaining the most widely used service. Notably, online learning has the lowest participation across all age groups, suggesting a potential area for digital education initiatives.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App