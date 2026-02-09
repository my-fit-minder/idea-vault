'use client';

import { Button } from './ui/Button';

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:5173';

export function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Idea organization icons - translucent background */}
        <div className="absolute top-20 left-10 w-48 h-48 text-primary-200 opacity-20 animate-float">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        
        <div className="absolute top-40 right-20 w-36 h-36 text-primary-300 opacity-15 animate-float animation-delay-1000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        
        <div className="absolute bottom-32 left-20 w-[168px] h-[168px] text-primary-200 opacity-20 animate-float animation-delay-2000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        
        <div className="absolute top-1/3 right-1/4 w-[120px] h-[120px] text-primary-300 opacity-15 animate-float animation-delay-3000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="absolute bottom-1/4 right-10 w-36 h-36 text-primary-200 opacity-20 animate-float animation-delay-4000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-1/3 w-[168px] h-[168px] text-primary-300 opacity-15 animate-float animation-delay-5000">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_4fr] gap-8 lg:gap-12 items-center">
          {/* Left side - Content (60%) */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="mb-6">
              <span className="inline-block px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                🗄️ Secure Storage & AI Roadmaps
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight">
              Store Your Ideas,
              <span className="text-primary-600 block mt-1.5">Get AI Roadmaps</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Secure cloud storage for all your ideas with AI-powered roadmap generation. 
              Store safely, access anywhere, and get actionable roadmaps to turn your ideas into reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-8">
              <Button
                href={WEB_APP_URL}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Get Started Free
              </Button>
              <Button
                onClick={scrollToFeatures}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
            
            {/* Stats Section */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                    1.2K+
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    Active Users
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Trusted by creators
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                    8.9K+
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    Ideas Stored
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    With AI roadmaps
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Offline Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Right side - Dashboard Image (40%) */}
          <div className="relative flex items-center justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400 rounded-xl transform rotate-2 opacity-20 blur-lg"></div>
              <div className="relative rounded-xl shadow-xl overflow-hidden border-4 border-white">
                <img
                  src="/dashboard.png"
                  alt="Ideafy Dashboard - Store ideas and get AI roadmaps"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* App Store Download Buttons - Centered below on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <a
            href="/coming-soon?platform=ios"
            className="inline-flex items-center justify-center transition-transform hover:scale-105"
          >
            <img
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1276560000"
              alt="Download on the App Store"
              className="h-10 w-auto"
            />
          </a>
          <a
            href="/coming-soon?platform=android"
            className="inline-flex items-center justify-center transition-transform hover:scale-105"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              className="h-10 w-auto"
            />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </section>
  );
}
