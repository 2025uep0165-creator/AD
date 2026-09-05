import { pricing, resolve, seo, studio } from '@/lib/content';

/**
 * LocalBusiness + TattooParlor.
 *
 * Everything here must match the Google Business Profile exactly — address,
 * phone and especially hours. A mismatch between the site and the profile is
 * a local-ranking problem, and it is also just confusing for someone standing
 * outside a closed shop.
 */
export function localBusinessJsonLd() {
  const lowPrice = pricing.rows
    .map((r) => (r.from === 'consult' ? undefined : resolve(r.from)))
    .filter((n): n is number => typeof n === 'number')
    .sort((a, b) => a - b)[0];

  return {
    '@context': 'https://schema.org',
    '@type': ['TattooParlor', 'LocalBusiness'],
    '@id': `${seo.siteUrl}/#studio`,
    name: studio.name,
    description: seo.description,
    url: seo.siteUrl,
    telephone: studio.phoneE164,
    image: `${seo.siteUrl}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${studio.address.line1}, ${studio.address.line2}`,
      addressLocality: studio.address.city,
      addressRegion: studio.address.region,
      postalCode: studio.address.postalCode,
      addressCountry: studio.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: studio.geo.lat,
      longitude: studio.geo.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: studio.hours.days,
        opens: studio.hours.opens,
        closes: studio.hours.closes,
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: studio.reviews.rating,
      reviewCount: studio.reviews.count,
      bestRating: 5,
      worstRating: 1,
    },
    ...(lowPrice ? { priceRange: `₹${lowPrice}+` } : {}),
    currenciesAccepted: 'INR',
    areaServed: { '@type': 'City', name: 'Jammu' },
    sameAs: [studio.instagram.studioUrl, studio.instagram.personalUrl],
    founder: { '@type': 'Person', name: studio.artist },
    ...(resolve(studio.established) ? { foundingDate: String(resolve(studio.established)) } : {}),
  };
}

/** FAQPage, built from the same array the accordion renders. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
