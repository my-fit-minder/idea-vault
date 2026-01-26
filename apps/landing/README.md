# Ideafy Landing Page

A modern, SEO-optimized landing page for Ideafy built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **SEO Optimized**: Server-side rendering, metadata API, structured data (JSON-LD), sitemap, and robots.txt
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Performance**: Optimized images, code splitting, and fast page loads
- **Accessible**: Semantic HTML, proper heading hierarchy, and keyboard navigation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the landing directory:
   ```bash
   cd apps/landing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (optional):
   ```env
   NEXT_PUBLIC_SITE_URL=https://ideafy.app
   NEXT_PUBLIC_WEB_APP_URL=https://app.ideafy.app
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Makefile

From the project root:
```bash
make landing
```

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
apps/landing/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main landing page
│   ├── globals.css          # Global styles
│   └── sitemap.ts           # Sitemap generation
├── components/
│   ├── Hero.tsx             # Hero section
│   ├── Features.tsx         # Features showcase
│   ├── HowItWorks.tsx       # Step-by-step guide
│   ├── Testimonials.tsx     # Social proof
│   ├── Pricing.tsx          # Pricing section
│   ├── FAQ.tsx              # FAQ accordion
│   ├── Footer.tsx           # Footer with links
│   └── ui/                  # Reusable components
│       ├── Button.tsx
│       └── Card.tsx
├── public/
│   └── robots.txt           # Robots file
└── package.json
```

## SEO Features

- **Metadata API**: Title, description, Open Graph, Twitter Cards
- **Structured Data**: JSON-LD for Organization, SoftwareApplication, FAQPage
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Configured for search engines
- **Semantic HTML**: Proper heading hierarchy and semantic elements

## Customization

### Environment Variables

- `NEXT_PUBLIC_SITE_URL`: The public URL of the landing page (for metadata)
- `NEXT_PUBLIC_WEB_APP_URL`: The URL of the main web app (for CTAs)

### Styling

The landing page uses Tailwind CSS. Customize colors in `tailwind.config.js`.

## License

MIT
