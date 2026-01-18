import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Idea Vault - Capture, Organize, and Develop Your Ideas',
  description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync across all your devices. Free to use.',
  keywords: ['idea management', 'productivity', 'note taking', 'idea organization', 'offline notes', 'AI insights'],
  authors: [{ name: 'Idea Vault' }],
  creator: 'Idea Vault',
  publisher: 'Idea Vault',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ideavault.app'),
  openGraph: {
    title: 'Idea Vault - Capture, Organize, and Develop Your Ideas',
    description: 'A powerful idea management application with offline support, AI-powered insights, and seamless sync across all your devices.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideavault.app',
    siteName: 'Idea Vault',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Idea Vault - Idea Management Application',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idea Vault - Capture, Organize, and Develop Your Ideas',
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
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideavault.app',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Idea Vault',
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
              name: 'Idea Vault',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ideavault.app',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ideavault.app'}/logo.png`,
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
                  name: 'What is Idea Vault?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Idea Vault is a powerful idea management application that helps you capture, organize, and develop your ideas. It features offline support, AI-powered insights, and seamless sync across all your devices.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Idea Vault really free?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! Idea Vault is completely free to use. There are no hidden fees, no credit card required, and all features are available to everyone. We believe great tools should be accessible to everyone.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does offline support work?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Idea Vault stores your ideas locally on your device, so you can create, edit, and view your ideas even without an internet connection. When you reconnect, all changes automatically sync to the cloud and across your devices.',
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
