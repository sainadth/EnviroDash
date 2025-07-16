import { useState, useEffect } from 'react';

const MarketingPanel = () => {
  const svgPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23E5E7EB' stroke-width='0.5'/%3E%3C/svg%3E")`;

  const slides = [
    {
      id: 1,
      title: "EnviroDash Analytics",
      subtitle: "Real-time environmental monitoring",
      description: "Monitor air quality, temperature, humidity, and pollution levels with our comprehensive IoT sensor network and interactive dashboard.",
      color: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      id: 2,
      title: "Smart Alerts & Notifications",
      subtitle: "Stay informed about environmental changes",
      description: "Receive instant notifications when environmental thresholds are exceeded. Set custom alerts for air quality, weather patterns, and more.",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600"
    },
    {
      id: 3,
      title: "Data-Driven Insights",
      subtitle: "Historical trends and predictive analysis",
      description: "Analyze environmental data trends over time. Get predictive insights to help you make informed decisions about your environment.",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600"
    },
    {
      id: 4,
      title: "Environmental Reports",
      subtitle: "Generate comprehensive reports",
      description: "Create detailed environmental reports with charts, graphs, and analysis. Export data for research, compliance, or sharing with stakeholders.",
      color: "bg-gradient-to-br from-orange-500 to-red-500"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-1/2 min-h-screen backdrop-blur-sm flex flex-col rounded-md" 
      style={{
        backgroundImage: svgPattern,
        backgroundRepeat: 'repeat',
        backgroundSize: '20px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <div className='flex min-h-screen items-center justify-center p-8'>
        <div className="relative w-full max-w-lg h-80 overflow-hidden rounded-lg shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200">
          {/* Slides */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div 
                key={slide.id}
                className="w-full flex-shrink-0 flex flex-col justify-center items-center text-gray-800 p-8"
              >
                <div className={`w-16 h-16 rounded-full ${slide.color} mb-6 flex items-center justify-center`}>
                  {slide.id === 1 && (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  )}
                  {slide.id === 2 && (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                  {slide.id === 3 && (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zM12 3L2 12h3v8h14v-8h3L12 3z"/>
                    </svg>
                  )}
                  {slide.id === 4 && (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">{slide.title}</h2>
                <h3 className="text-sm font-medium mb-3 text-center text-gray-600">{slide.subtitle}</h3>
                <p className="text-center text-sm leading-relaxed text-gray-500">{slide.description}</p>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-full transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-full transition-colors duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPanel;
