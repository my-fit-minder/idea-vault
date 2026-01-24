/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Primary accent color - matching web app purple/indigo theme
const tintColorLight = '#667eea'; // Purple/indigo - same as web
const tintColorDark = '#667eea';  // Keep consistent

export const Colors = {
  light: {
    text: '#1a202c',           // Dark text - same as web
    textSecondary: '#4a5568',  // Medium text
    textMuted: '#718096',      // Light text
    background: '#f7fafc',     // Light gray background - same as web
    tint: tintColorLight,
    icon: '#718096',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorLight,
    card: '#ffffff',           // White cards
    border: '#e2e8f0',         // Border color - same as web
    error: '#c53030',
    errorBg: '#fed7d7',
  },
  dark: {
    text: '#f7fafc',
    textSecondary: '#a0aec0',
    textMuted: '#718096',
    background: '#1a202c',
    tint: tintColorDark,
    icon: '#a0aec0',
    tabIconDefault: '#a0aec0',
    tabIconSelected: tintColorDark,
    card: '#2d3748',
    border: '#4a5568',
    error: '#fc8181',
    errorBg: '#742a2a',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
