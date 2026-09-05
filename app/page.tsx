import Artist from '@/components/Artist';
import Contact from '@/components/Contact';
import ContentTodo from '@/components/ContentTodo';
import CoverUp from '@/components/CoverUp';
import Lettering from '@/components/Lettering';
import Faq from '@/components/Faq';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Grain from '@/components/Grain';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Hygiene from '@/components/Hygiene';
import LoadTransition from '@/components/LoadTransition';
import Motion from '@/components/Motion';
import Pricing from '@/components/Pricing';
import Process from '@/components/Process';
import Reels from '@/components/Reels';
import Reveal from '@/components/Reveal';
import Reviews from '@/components/Reviews';
import SmoothScroll from '@/components/SmoothScroll';
import StickyBar from '@/components/StickyBar';
import { faq } from '@/lib/content';
import { faqJsonLd, localBusinessJsonLd } from '@/lib/jsonld';

/**
 * Section order is the brief's, with one deliberate change: the lettering
 * feature sits directly under the hero rather than lower down. On a phone
 * whatever comes second is what decides whether there is a third.
 */
export default function Page() {
  // Only questions with a confirmed answer go into FAQPage structured data —
  // Google should never be handed a placeholder.
  const answerable = faq
    .map((f): { q: string; a: string | null } => ({
      q: f.q,
      a: typeof f.a === 'string' ? f.a : null,
    }))
    .filter((f): f is { q: string; a: string } => f.a !== null);

  return (
    <Motion>
      <LoadTransition />
      <SmoothScroll />
      <Reveal />
      <Grain />

      <Header />

      <main id="main">
        <Hero />
        <Lettering />
        <Gallery />
        <Reels />
        <CoverUp />
        <Pricing />
        <Process />
        <Hygiene />
        <Artist />
        <Reviews />
        <Faq />
        <Contact />
      </main>

      <Footer />
      <StickyBar />

      {/* Folded away by the production build. */}
      {process.env.NODE_ENV === 'development' && <ContentTodo />}

      <script
        type="application/ld+json"
        // Static, build-time JSON from lib/content.ts — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(answerable)) }}
      />
    </Motion>
  );
}
