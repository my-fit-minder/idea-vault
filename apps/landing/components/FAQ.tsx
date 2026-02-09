'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What is Ideafy?',
    answer: 'Ideafy is a secure idea storage platform that helps you store your ideas safely in the cloud and generate AI-powered product and validation roadmaps. It features secure cloud storage, offline support, and seamless sync across all your devices.',
  },
  {
    question: 'Is Ideafy really free?',
    answer: 'Yes! Ideafy is completely free to use. There are no hidden fees, no credit card required, and all features including secure storage and AI roadmap generation are available to everyone. We believe great tools should be accessible to everyone.',
  },
  {
    question: 'How does storage and roadmap generation work?',
    answer: 'Ideafy stores your ideas securely in the cloud with encryption. You can access your stored ideas from any device. For any idea, you can generate AI-powered product roadmaps or validation roadmaps that provide actionable steps to develop or validate your ideas. When offline, your ideas are stored locally and sync automatically when you reconnect.',
  },
  {
    question: 'What are AI roadmaps?',
    answer: 'AI roadmaps are comprehensive, AI-generated plans for your ideas. Product roadmaps break down your idea into clear development phases, while validation roadmaps help you test and validate your ideas before full development. Both provide actionable steps to turn your ideas into reality.',
  },
  {
    question: 'Do you have a mobile app?',
    answer: 'Currently, Ideafy is available as a web application that works great on mobile browsers. A native mobile app is in development and will be available soon.',
  },
  {
    question: 'Can I use Ideafy for team collaboration?',
    answer: 'Currently, Ideafy is designed for personal use. Each account is private and secure. Team collaboration features may be added in the future based on user feedback.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Ideafy
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
