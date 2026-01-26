import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Tracking Pixel IDs (set these in environment variables)
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const metadata: Metadata = {
  title: 'Ideafy - Capture, Organize, and Develop Your Ideas',
  description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync across all your devices. Free to use.',
  keywords: ['idea management', 'productivity', 'note taking', 'idea organization', 'offline notes', 'AI insights'],
  authors: [{ name: 'Ideafy' }],
  creator: 'Ideafy',
  publisher: 'Ideafy',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ideafy.zensthub.com'),
  openGraph: {
    title: 'Ideafy - Capture, Organize, and Develop Your Ideas',
    description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync across all your devices.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideafy.zensthub.com',
    siteName: 'Ideafy',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ideafy - Idea Management Application',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ideafy - Capture, Organize, and Develop Your Ideas',
    description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideafy.zensthub.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (gtag.js) */}
        {GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ANALYTICS_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Ideafy',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
              },
              description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync across all your devices.',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ideafy',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideafy.zensthub.com',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ideafy.zensthub.com'}/logo.png`,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Ideafy?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ideafy is a powerful idea management application that helps you capture, organize, and develop your ideas. It features offline support, AI-powered insights, and seamless sync across all your devices.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Ideafy really free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! Ideafy is completely free to use. There are no hidden fees, no credit card required, and all features are available to everyone. We believe great tools should be accessible to everyone.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does offline support work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ideafy stores your ideas locally on your device, so you can create, edit, and view your ideas even without an internet connection. When you reconnect, all changes automatically sync to the cloud and across your devices.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is my data secure and private?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely. Your data is encrypted and stored securely. We use industry-standard authentication and encryption to protect your information. Your ideas are private and only accessible to you.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Meta Pixel NoScript Fallback */}
        {META_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
