import { useEffect } from 'react';
import { initGoogleAnalytics, initMetaPixel } from '../lib/analytics';

/**
 * Analytics component that initializes Google Analytics and Meta Pixel
 * 
 * Add your tracking IDs to .env:
 *   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
 *   VITE_META_PIXEL_ID=XXXXXXXXXXXXXXX
 * 
 * For tracking events, import from lib/analytics:
 *   import { trackGAEvent, trackMetaEvent, trackPageView } from '../lib/analytics';
 */
export function Analytics() {
  useEffect(() => {
    initGoogleAnalytics();
    initMetaPixel();
  }, []);

  return null;
}
