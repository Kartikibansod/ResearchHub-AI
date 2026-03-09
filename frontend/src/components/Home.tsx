import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HomeProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Intelligent Research Paper Management",
      subtitle: "Discover, organize, and analyze academic research with AI-powered insights",
      image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=600&fit=crop&q=80"
    },
    {
      title: "AI-Powered Research Assistant",
      subtitle: "Get instant answers and insights from your research papers using advanced AI",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop&q=80"
    },
    {
      title: "Organize Your Research Efficiently",
      subtitle: "Create workspaces, import papers, and keep your research perfectly organized",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleFeatureClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">ResearchHub AI</h1>
                <p className="text-xs text-gray-500">Intelligent Research Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/search" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                    Search
                  </Link>
                  <Link to="/workspace" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                    Workspaces
                  </Link>
                  <Link to="/chat" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                    AI Chat
                  </Link>
                  <button 
                    onClick={onLogout}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-cyan-600 font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link 
                    to="/login"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section with Slideshow */}
      <div className="relative bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-500 text-white overflow-hidden h-[600px]">
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-600 opacity-80"></div>
            </div>
          ))}
        </div>

        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-24 relative h-full flex items-center">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90">
              {slides[currentSlide].subtitle}
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all shadow-xl hover:scale-105 transform"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 - Search */}
          <button
            onClick={() => handleFeatureClick('/search')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all text-center transform hover:scale-105 cursor-pointer"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Search</h3>
            <p className="text-gray-600 mb-4">
              Search millions of research papers from arXiv with intelligent filtering and recommendations
            </p>
            <span className="text-cyan-600 font-medium hover:text-cyan-700">
              {isAuthenticated ? 'Go to Search →' : 'Learn more →'}
            </span>
          </button>

          {/* Feature 2 - Organize */}
          <button
            onClick={() => handleFeatureClick('/workspace')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all text-center transform hover:scale-105 cursor-pointer"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Organize</h3>
            <p className="text-gray-600 mb-4">
              Create workspaces for different projects and keep your research organized and accessible
            </p>
            <span className="text-cyan-600 font-medium hover:text-cyan-700">
              {isAuthenticated ? 'Go to Workspaces →' : 'Learn more →'}
            </span>
          </button>

          {/* Feature 3 - AI Insights */}
          <button
            onClick={() => handleFeatureClick('/chat')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all text-center transform hover:scale-105 cursor-pointer"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI Insights</h3>
            <p className="text-gray-600 mb-4">
              Chat with AI to get summaries, comparisons, and insights from your research papers
            </p>
            <span className="text-cyan-600 font-medium hover:text-cyan-700">
              {isAuthenticated ? 'Go to AI Chat →' : 'Learn more →'}
            </span>
          </button>

          {/* Feature 4 - Dashboard */}
          <button
            onClick={() => handleFeatureClick('/dashboard')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all text-center transform hover:scale-105 cursor-pointer"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Fast & Efficient</h3>
            <p className="text-gray-600 mb-4">
              Powered by Groq's Llama 3.3 70B for lightning-fast AI responses and analysis
            </p>
            <span className="text-cyan-600 font-medium hover:text-cyan-700">
              {isAuthenticated ? 'Go to Dashboard →' : 'Learn more →'}
            </span>
          </button>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="overflow-hidden rounded-2xl mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=400&h=300&fit=crop" 
                  alt="Search Papers"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-cyan-600 mb-2">Search & Discover</h3>
              <p className="text-gray-600">
                Search through millions of academic papers from arXiv and find exactly what you need
              </p>
            </div>

            <div className="group">
              <div className="overflow-hidden rounded-2xl mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" 
                  alt="Organize"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-cyan-600 mb-2">Organize Projects</h3>
              <p className="text-gray-600">
                Create workspaces for different research topics and keep everything organized
              </p>
            </div>

            <div className="group">
              <div className="overflow-hidden rounded-2xl mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop" 
                  alt="AI Analysis"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-cyan-600 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Get instant insights, summaries, and answers from your research papers using AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-8">
            Join researchers worldwide using AI to accelerate their work
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all shadow-xl"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
