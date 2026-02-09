'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:5173';

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform') || 'mobile';
  const platformName = platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Mobile';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            The {platformName} app is on its way!
          </p>
          <p className="text-lg text-gray-500">
            We&apos;re working hard to bring you the best mobile experience.
          </p>
        </div>

        <div className="mt-12">
          <p className="text-gray-600 mb-4">
            In the meantime, you can use our web app:
          </p>
          <Button
            href={WEB_APP_URL}
            variant="primary"
            size="lg"
          >
            Use Web App
          </Button>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <ComingSoonContent />
    </Suspense>
  );
}
