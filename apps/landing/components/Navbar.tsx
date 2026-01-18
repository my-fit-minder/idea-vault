'use client';

import Link from 'next/link';
import { Button } from './ui/Button';

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:5173';

export function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
            💡 Idea Vault
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              FAQ
            </button>
            <Button href={WEB_APP_URL} variant="primary" size="sm">
              Get Started
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button href={WEB_APP_URL} variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
