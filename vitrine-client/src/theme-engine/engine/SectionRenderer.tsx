'use client';

import { lazy, Suspense } from 'react';
import type { SectionConfig } from './types';

// Lazy load des sections (optimisation performance)
const HeroSlider = lazy(() => import('../components/sections/HeroSlider'));
const Hero = lazy(() => import('../components/sections/Hero'));
const FeaturedProducts = lazy(() => import('../components/sections/FeaturedProducts'));
const Newsletter = lazy(() => import('../components/sections/Newsletter'));
const Testimonials = lazy(() => import('../components/sections/Testimonials'));
const FAQ = lazy(() => import('../components/sections/FAQ'));
const TrustBadges = lazy(() => import('../components/sections/TrustBadges'));
const CallToAction = lazy(() => import('../components/sections/CallToAction'));
const Blog = lazy(() => import('../components/sections/Blog'));
const Contact = lazy(() => import('../components/sections/Contact'));

interface SectionRendererProps {
  sections: SectionConfig[];
}

function SectionFallback() {
  return (
    <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
  );
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = section.id || `${section.type}-${index}`;

        let SectionComponent;
        switch (section.type) {
          case 'hero-slider':
            SectionComponent = HeroSlider;
            break;
          case 'hero':
            SectionComponent = Hero;
            break;
          case 'featured-products':
            SectionComponent = FeaturedProducts;
            break;
          case 'newsletter':
            SectionComponent = Newsletter;
            break;
          case 'testimonials':
            SectionComponent = Testimonials;
            break;
          case 'faq':
            SectionComponent = FAQ;
            break;
          case 'trust-badges':
            SectionComponent = TrustBadges;
            break;
          case 'call-to-action':
            SectionComponent = CallToAction;
            break;
          case 'blog':
            SectionComponent = Blog;
            break;
          case 'contact':
            SectionComponent = Contact;
            break;
          default:
            console.warn(`Section type "${section.type}" not found`);
            return null;
        }

        return (
          <Suspense key={key} fallback={<SectionFallback />}>
            <SectionComponent
              variant={section.variant}
              config={section.config}
              className={section.className}
            />
          </Suspense>
        );
      })}
    </>
  );
}
