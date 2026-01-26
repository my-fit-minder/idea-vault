'use client';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:5173';

const features = [
  'Unlimited ideas',
  'Offline support',
  'AI-powered insights',
  'Tag system',
  'Search & filter',
  'Secure authentication',
  'Cross-device sync',
  'Export your data',
];

export function Pricing() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. No credit card required. All features included.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="relative border-2 border-primary-500 shadow-2xl">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-600 text-white px-6 py-1 rounded-full text-sm font-semibold">
                Free Forever
              </span>
            </div>
            
            <div className="text-center pt-8">
              <div className="mb-4">
                <span className="text-6xl font-bold text-gray-900">$0</span>
                <span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-8 text-lg">
                Everything you need to manage your ideas, completely free.
              </p>
              
              <div className="mb-8">
                <Button
                  href={WEB_APP_URL}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Everything included:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  No hidden fees. No credit card required. Start using Ideafy today.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
