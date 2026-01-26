// Analytics utility functions
// Tracking IDs from environment variables

export const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

// Facebook Pixel type
interface FBQ {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
  push: typeof Array.prototype.push;
}

// Extend Window interface for gtag and fbq
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FBQ;
    _fbq?: FBQ;
  }
}

/**
 * Initialize Google Analytics
 */
export function initGoogleAnalytics(): void {
  if (!GOOGLE_ANALYTICS_ID || typeof window.gtag === 'function') return;

  // Load gtag script
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(gtagScript);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ANALYTICS_ID, {
    page_path: window.location.pathname,
  });

  console.log('📊 Google Analytics initialized');
}

/**
 * Initialize Meta Pixel
 */
export function initMetaPixel(): void {
  if (!META_PIXEL_ID || typeof window.fbq === 'function') return;

  // Meta Pixel base code
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as FBQ;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.push = Array.prototype.push;

  if (!window._fbq) window._fbq = fbq;
  window.fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);

  console.log('📘 Meta Pixel initialized');
}

/**
 * Track custom events with Google Analytics
 */
export function trackGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track custom events with Meta Pixel
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
  }
}

/**
 * Track page view (useful for SPA navigation)
 */
export function trackPageView(path?: string): void {
  const pagePath = path || window.location.pathname;

  // Google Analytics
  if (typeof window.gtag === 'function' && GOOGLE_ANALYTICS_ID) {
    window.gtag('config', GOOGLE_ANALYTICS_ID, {
      page_path: pagePath,
    });
  }

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}
