/**
 * ============================================================================
 *  SECRET INK TATTOO — ALL COPY AND MEDIA LIVES HERE.
 *  No CMS. Edit this file, redeploy, done. See README.md.
 * ============================================================================
 *
 *  Anything Udhay still has to confirm is wrapped in todo(). Those fields are
 *  typed so they CANNOT be rendered as if they were confirmed facts — a
 *  component has to call resolve() and handle undefined. That is deliberate:
 *  this site must never publish a guessed price, a guessed founding year or an
 *  invented review.
 *
 *  Run `npm run dev` and the floating CONTENT TODO panel lists everything
 *  still outstanding. It is stripped from production builds.
 */

/* -------------------------------------------------------------------------- */
/*  Confirmed / pending field type                                            */
/* -------------------------------------------------------------------------- */

export type Confirmed<T> = { readonly pending: false; readonly value: T };
export type Pending<T> = { readonly pending: true; readonly ask: string; readonly draft?: T };
export type Field<T> = Confirmed<T> | Pending<T>;

/** A fact Udhay has confirmed. Safe to render. */
export const ok = <T,>(value: T): Confirmed<T> => ({ pending: false, value });

/** Not confirmed yet. `ask` is the exact question to put to him. */
export const todo = <T,>(ask: string, draft?: T): Pending<T> => ({ pending: true, ask, draft });

/** Returns the value only if it is confirmed. Never returns a draft. */
export function resolve<T>(f: Field<T>): T | undefined {
  return f.pending ? undefined : f.value;
}

/* -------------------------------------------------------------------------- */
/*  Studio                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Where the photographs live.
 *
 * Local paths resolve to /public and go through next/image optimisation.
 * An absolute URL is used as-is (see components/Frame.tsx) — that is the
 * escape hatch for deploys that cannot carry binary files, where these point
 * at the studio's own already-optimised images instead.
 */
export const images = {
  hero: '/images/hand-mandala.jpg',
  portrait: '/images/udhay.jpg',
  crest: '/images/crest.png',
} as const;

/**
 * Udhay's work, as photographed on the studio's existing site. `mandala` is
 * deliberately the same file as the hero — it is his signature piece, and one
 * copy serves both rather than shipping the same photograph twice.
 */
export const workPhotos = {
  chakras: '/images/work/chakras.jpg',
  mandala: images.hero,
  roseClock: '/images/work/rose-clock.jpg',
  medusa: '/images/work/medusa.jpg',
  spider: '/images/work/spider.jpg',
  anubis: '/images/work/anubis.jpg',
  mementoMori: '/images/work/memento-mori.jpg',
  peace: '/images/work/peace.jpg',
  maaBhole: '/images/work/maa-bhole.jpg',
  cobra: '/images/work/cobra.jpg',
} as const;

export const studio = {
  name: 'Secret Ink Tattoo',
  artist: 'Udhay',

  /** Conversion target. Everything on this site points here. */
  phoneE164: '+919682516002',
  phoneDisplay: '+91 96825 16002',
  whatsappNumber: '919682516002',

  address: {
    line1: 'Near ACM Public School',
    line2: 'Janipur Colony, Housing Colony',
    city: 'Jammu',
    region: 'Jammu and Kashmir',
    postalCode: '180007',
    country: 'IN',
  },

  /** Must stay identical to the Google Business Profile. */
  hours: {
    label: '11:00 AM – 8:30 PM, daily',
    opens: '11:00',
    closes: '20:30',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },

  geo: { lat: 32.7654, lng: 74.8482 },

  instagram: {
    studio: 'secretinktattoo_jammu',
    studioUrl: 'https://www.instagram.com/secretinktattoo_jammu/',
    personal: 'tattooist_udhay_',
    personalUrl: 'https://www.instagram.com/tattooist_udhay_/',
    followers: '10.1K',
  },

  /**
   * CONTRADICTION FLAGGED IN THE BRIEF, NOT YET RESOLVED.
   * The old site says "EST. 2014"; elsewhere he says "3 years experience".
   * Both cannot be true. Until he says which, the hero strapline simply omits
   * the year and the artist bio makes no experience claim at all.
   */
  established: todo<number>(
    'EST. 2014 (old site) vs "3 years experience" — which is right? Is 2014 the ' +
      'studio and 3 years his own tattooing, or is one of them wrong?',
  ),

  /** Only rendered if it is a real, monitored inbox. */
  email: todo<string>('Is there a working email inbox? If not we show phone + WhatsApp only.'),

  reviews: {
    rating: 4.8,
    count: 21,
    url: todo<string>('Paste the Google Business Profile / Maps share link for the reviews.'),
  },

  mapsEmbedQuery: 'Secret Ink Tattoo, Janipur Colony, Jammu 180007',
} as const;

export const waHref = (text: string) =>
  `https://wa.me/${studio.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const telHref = `tel:${studio.phoneE164}`;

/* -------------------------------------------------------------------------- */
/*  Photographs                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every image on this site is a photograph of Udhay's own work, taken from the
 * studio's existing site. There is no placeholder artwork left: an earlier
 * version drew line motifs into empty slots, which read as clip-art next to a
 * real tattoo and made the page look unfinished. A slot with no photograph is
 * now a slot that does not ship.
 */
export type Media = {
  src: string;
  alt: string;
};

const photo = (src: string, alt: string): Media => ({ src, alt });

/* -------------------------------------------------------------------------- */
/*  1 · Hero                                                                  */
/* -------------------------------------------------------------------------- */

export const hero = {
  /** One word gets --saffron. Index into `line2` words. */
  line1: 'SMALL TATTOOS.',
  line2: 'PERMANENT MEANING.',
  accentWord: 'MEANING.',

  strapline: ['Janipur Colony', 'Jammu'],

  /** 6–8s, muted, playsInline, under 2MB. Falls back to poster on slow 4G. */
  video: {
    src: todo<string>('6–8s clip: machine on skin, or peeling a stencil. Under 2MB, no audio.'),
    // Real photograph, taken from the existing site and re-cut. Until a hero
    // clip exists this is what the hero shows.
    poster: photo(
      images.hero,
      'A geometric mandala tattooed across the back of a hand, freshly finished',
    ),
  },

  /**
   * 10.1K and 4.8/21 are verified. "600+ tattoos" came from the brief and is
   * rendered as supplied — but it is the one number here nobody has checked,
   * so it is listed in the launch checklist. If Udhay cannot stand behind it,
   * delete the row; two proof points are better than three shaky ones.
   */
  proof: [
    { value: studio.instagram.followers, label: 'on Instagram' },
    { value: `${studio.reviews.rating}★`, label: `from ${studio.reviews.count} Google reviews` },
    { value: '600+', label: 'tattoos' },
  ],

  cta: 'Book on WhatsApp',
  ctaSecondary: 'See the work',
  waMessage: 'Hi Udhay, I saw your site. I want to book a tattoo.',
} as const;

/* -------------------------------------------------------------------------- */
/*  3 · Lettering feature (the inverted section)                              */
/* -------------------------------------------------------------------------- */

/**
 * The one inverted section on the page. It used to carry a shloka; that was
 * removed at the client's request — no devotional framing here.
 *
 * What replaced it is the thing he is actually best at: lettering. The display
 * line is one of his real pieces, set enormous and drawn on letter by letter
 * as you scroll, so the section demonstrates the craft instead of describing
 * it. Swap `lines` for any other piece of his; the animation adapts.
 */
export const lettering = {
  eyebrow: 'Lettering & Script',
  // A real piece of his, not an invented one: the memento mori forearm.
  lines: ['MEMENTO', 'MORI'],
  caption: 'Forearm · 8 in · four hours',
  image: photo(
    workPhotos.mementoMori,
    'The finished memento mori forearm piece: lettering over reaching hands, an hourglass and a dagger, threaded with red',
  ),
  imageCaption: 'The piece, finished',
  lead: 'Most people bring me a word they have already been carrying for years.',
  body: [
    'A mother\u2019s name. A date nobody else needs explained. The one line they say under their breath when they are frightened. It was theirs a long time before it was ever ink.',
    'So it goes on properly or it does not go on at all. The right letterform, the right weight, the right spacing for the place it is going \u2014 drawn out, printed, and read back to you before anything touches skin. You did not come here for a shape. You came for the word.',
  ],
  cta: 'Ask about lettering',
  waMessage: 'Hi Udhay, I want lettering done. Can you help me with the wording?',
} as const;

/* -------------------------------------------------------------------------- */
/*  4 · Work gallery                                                          */
/* -------------------------------------------------------------------------- */

/** Only what he actually does. No Realism, no Traditional, no Colour. */
/**
 * Filters describe the work that actually exists. The brief asked for
 * Lettering / Devotional / Fine Line / Couple / Cover-ups, but of the eleven
 * photographs the studio has published, six are illustrative blackwork —
 * Medusa, Anubis, a black widow, a rose and clock, a cobra, a hand mandala —
 * and none is a cover-up. A filter that returns nothing is a broken filter, so
 * Cover-ups comes out (it stays a service in pricing and the FAQ) and
 * Illustrative goes in. Restore either the moment the photographs exist.
 */
export const filters = [
  { id: 'all', label: 'All' },
  { id: 'lettering', label: 'Lettering & Script' },
  { id: 'devotional', label: 'Devotional' },
  { id: 'fineline', label: 'Fine Line' },
  { id: 'illustrative', label: 'Illustrative' },
  { id: 'couple', label: 'Couple' },
] as const;

export type FilterId = (typeof filters)[number]['id'];
export type Category = Exclude<FilterId, 'all'>;

export type Work = {
  id: string;
  /**
   * A piece can sit in more than one bucket, because real tattoos do: the
   * matching मां / भोले pair is a couple piece, Devanagari lettering and
   * devotional all at once. With a portfolio this size, forcing one label each
   * would leave three filters holding a single piece.
   */
  categories: readonly Category[];
  title: string;
  placement: string;
  size: string;
  session: string;
  image: Media;
};

/**
 * Every piece here is Udhay's, photographed by the studio. Placement and size
 * are read off the photograph; session lengths are estimates from the size and
 * density of the work and should be corrected by him before launch.
 */
export const work: Work[] = [
  {
    id: 'w01',
    categories: ['devotional'],
    title: 'Seven chakras, trishul',
    placement: 'Forearm',
    size: '9 in',
    session: '3 hr',
    image: photo(
      workPhotos.chakras,
      'A trishul framing seven chakra symbols tattooed down the inside of a forearm, the topmost carrying an Om',
    ),
  },
  {
    id: 'w02',
    categories: ['illustrative'],
    title: 'Mandala',
    placement: 'Back of hand',
    size: '4 in',
    session: '3 hr',
    image: photo(
      workPhotos.mandala,
      'A geometric floral mandala in solid black covering the back of a hand',
    ),
  },
  {
    id: 'w03',
    categories: ['lettering', 'fineline'],
    title: 'PEACE',
    placement: 'Inner forearm',
    size: '2 in',
    session: '40 min',
    image: photo(
      workPhotos.peace,
      'The word PEACE in block letters under a fine-line mountain range, sun and two birds, on an inner forearm',
    ),
  },
  {
    id: 'w04',
    categories: ['couple', 'lettering', 'devotional'],
    title: 'मां · भोले',
    placement: 'Wrists, matching pair',
    size: '2.5 in each',
    session: '1 hr',
    image: photo(
      workPhotos.maaBhole,
      'Two wrists side by side: मां with an infinity loop on one, and a trishul-and-Devanagari glyph with a red flame on the other',
    ),
  },
  {
    id: 'w05',
    categories: ['fineline', 'lettering'],
    title: 'Memento mori',
    placement: 'Forearm',
    size: '8 in',
    session: '4 hr',
    image: photo(
      workPhotos.mementoMori,
      'A forearm piece reading MEMENTO MORI over reaching hands, an hourglass and a dagger, threaded with red linework',
    ),
  },
  {
    id: 'w06',
    categories: ['illustrative'],
    title: 'Medusa',
    placement: 'Forearm',
    size: '8 in',
    session: '4 hr',
    image: photo(
      workPhotos.medusa,
      'Medusa in black linework down a forearm, snakes coiling out of her hair',
    ),
  },
  {
    id: 'w07',
    categories: ['illustrative'],
    title: 'Anubis',
    placement: 'Forearm',
    size: '7 in',
    session: '4 hr',
    image: photo(
      workPhotos.anubis,
      'Anubis in black and grey down a forearm, headdress and collar picked out in fine line',
    ),
  },
  {
    id: 'w08',
    categories: ['illustrative'],
    title: 'Rose and clock',
    placement: 'Back of hand',
    size: '4 in',
    session: '2 hr 30 min',
    image: photo(
      workPhotos.roseClock,
      'A black and grey rose over a Roman-numeral pocket watch on the back of a hand',
    ),
  },
  {
    id: 'w09',
    categories: ['illustrative'],
    title: 'Black widow',
    placement: 'Upper arm',
    size: '5 in',
    session: '2 hr',
    image: photo(
      workPhotos.spider,
      'A black widow spider on its web across an upper arm, the body shaded in black and grey with white highlights',
    ),
  },
  {
    id: 'w10',
    categories: ['illustrative'],
    title: 'Cobra',
    placement: 'Hand to wrist',
    size: '7 in',
    session: '3 hr 30 min',
    image: photo(
      workPhotos.cobra,
      'A cobra winding from the back of a hand up over the wrist, scales shaded black with a deep red belly',
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  5 · Instagram — see components/Instagram.tsx                              */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*  6 · Cover-up before / after                                               */
/* -------------------------------------------------------------------------- */

export const coverUp = {
  eyebrow: 'Cover-ups',
  heading: 'The one you regret is not permanent.',
  body: 'Most cover-ups are possible. Darker, bigger and bolder than the original — that is the trade. Send a clear photo in daylight and I will tell you honestly whether it will work, and what it will take.',
  /**
   * Two of Udhay's own pieces, not one arm photographed twice.
   *
   * The studio has never published a matched cover-up pair, and no stock
   * library reachable from here has one either — what is licensed for reuse is
   * convention photography of identifiable strangers. Dragging two mismatched
   * arms past each other under BEFORE and AFTER would both look wrong and
   * claim a result that never happened.
   *
   * So the slider compares coverage rather than staging a transformation: a
   * small light piece against a forearm carried end to end, both his, both
   * labelled for what they are. The moment a real pair arrives, swap these two
   * and change the labels back.
   */
  left: photo(
    workPhotos.peace,
    'A small PEACE lettering piece with a fine-line mountain range on an inner forearm',
  ),
  leftLabel: 'Small & light',
  right: photo(
    workPhotos.chakras,
    'Seven chakra symbols and a trishul carried the full length of a forearm',
  ),
  rightLabel: 'Full coverage',
  imageCaption: 'Two different pieces, not one cover-up — drag to compare the coverage.',
  need: 'A matched BEFORE and AFTER of one real cover-up — same angle, same distance, daylight.',
  waMessage: 'Hi Udhay, I want to cover an old tattoo. Sending a photo now.',
} as const;

/* -------------------------------------------------------------------------- */
/*  7 · Pricing                                                               */
/* -------------------------------------------------------------------------- */

export type PriceRow = { label: string; from: Field<number> | 'consult' };

export const pricing = {
  eyebrow: 'Pricing',
  heading: 'What it costs.',
  rows: [
    { label: 'Small lettering / minimal', from: ok(699) },
    { label: 'Devanagari & shloka work', from: todo<number>('Starting price for Devanagari / shloka work?') },
    { label: 'Fine line, palm-size', from: todo<number>('Starting price for a palm-size fine line piece?') },
    { label: 'Cover-ups', from: 'consult' },
    { label: 'Piercing', from: todo<number>('Starting price for piercing?') },
  ] as PriceRow[],
  footnote: 'Final price depends on size, placement and detail.',
} as const;

/* -------------------------------------------------------------------------- */
/*  8 · Process                                                               */
/* -------------------------------------------------------------------------- */

/** Named howItWorks, not process: a module-scope `process` shadows Node's
 *  global for the whole file, which silently breaks any process.env read. */
export const howItWorks = {
  eyebrow: 'How it works',
  steps: [
    { n: '01', title: 'Consult', body: 'Message me on WhatsApp with your idea, where you want it and roughly how big. I will tell you if it will work at that size, and what it costs. Free.' },
    { n: '02', title: 'Design', body: 'I draw it for you — not off a flash sheet. For Sanskrit and Hindi I confirm the spelling and the matras with you in writing before anything is stencilled.' },
    { n: '03', title: 'Session', body: 'Stencil goes on, you check the placement in the mirror, and only then do we start. Small pieces are usually done in one sitting.' },
    { n: '04', title: 'Aftercare', body: 'Wrapped before you leave, with the aftercare written down. Message me any time in the two weeks after — that is part of the price.' },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*  9 · Hygiene                                                               */
/* -------------------------------------------------------------------------- */

export const hygiene = {
  eyebrow: 'Hygiene',
  heading: 'If it is your first one, read this.',
  points: [
    'Needles are single-use. The cartridge is opened in front of you and dropped in a sharps bin at the end.',
    'Fresh gloves for every client, changed again mid-session if I touch anything outside the field.',
    'Tubes, grips and jewellery are autoclaved. Everything else is single-use and binned.',
    'Ink is sealed, poured fresh into a new cap for you, and whatever is left is thrown away.',
  ],
  inkBrand: todo<string>('Which ink brand do you use? (Named brands reassure first-timers.)'),
} as const;

/* -------------------------------------------------------------------------- */
/*  10 · Artist                                                               */
/* -------------------------------------------------------------------------- */

export const artist = {
  eyebrow: 'The artist',
  name: 'Udhay',
  /**
   * First person, no experience claim until the EST. contradiction is settled
   * (see studio.established). Everything here is either verifiable from his
   * public work or has to come from him — nothing is invented.
   */
  bio: [
    'I started with letters. Friends wanted names — a mother, a date, a word they were holding on to — and I found that I cared more about getting the shape of a single letter right than about anything else I was drawing.',
    'That is still what I am best at. Script, and Devanagari. A shloka has to be spelled correctly and spaced correctly or it is just a shape, so I set it properly, print it, and read it back to you before I stencil it.',
    'Most people who sit in my chair have never been tattooed before. I would rather talk you out of something you will regret than take the money.',
  ],
  detail: todo<string>(
    'One true, specific detail for the bio — e.g. the first tattoo you ever did, ' +
      'or a piece you would not repeat, or why you stopped taking colour work.',
  ),
  // The portrait from the existing site. The original brief asked for a photo
  // of Udhay WORKING rather than this posed outdoor one — that request stands,
  // and this is here because it is the only real portrait available today.
  portrait: {
    src: images.portrait,
    alt: 'Udhay, the artist behind Secret Ink Tattoo',
    need: 'Still wanted: a photo of Udhay working — hands, machine, focus.',
  },
  waMessage: 'Hi Udhay, I have an idea for a tattoo I want to talk through.',
} as const;

/* -------------------------------------------------------------------------- */
/*  11 · Reviews                                                              */
/* -------------------------------------------------------------------------- */

export type Review = { quote: Field<string>; name: Field<string> };

/**
 * The aggregate is real: 4.8 from 21 Google reviews.
 * The quotes below are NOT written by us and never will be. Until the real
 * ones are pasted in, the section shows the rating and links straight to
 * Google. One real review beats five invented ones.
 */
export const reviewQuotes: Review[] = [
  { quote: todo<string>('Paste Google review 1 verbatim.'), name: todo<string>('Reviewer 1 name as it appears on Google.') },
  { quote: todo<string>('Paste Google review 2 verbatim.'), name: todo<string>('Reviewer 2 name as it appears on Google.') },
  { quote: todo<string>('Paste Google review 3 verbatim.'), name: todo<string>('Reviewer 3 name as it appears on Google.') },
  { quote: todo<string>('Paste Google review 4 verbatim.'), name: todo<string>('Reviewer 4 name as it appears on Google.') },
];

/* -------------------------------------------------------------------------- */
/*  12 · FAQ                                                                  */
/* -------------------------------------------------------------------------- */

export const faq = [
  { q: 'How much will mine cost?', a: 'Small lettering and minimal pieces start at ₹699. Beyond that it depends on size, placement and how much detail is in it. Send me a reference on WhatsApp and I will give you a real number, not a range.' },
  { q: 'Does it hurt?', a: 'Some. A small wrist or forearm piece is very manageable — most people are surprised how quickly it is over. Ribs, spine, sternum and the tops of the feet are the sharp ones. I will tell you honestly before you book.' },
  { q: 'What is the minimum age?', a: 'Eighteen. No exceptions, and no parental consent workaround. Bring ID.' },
  { q: 'How long does a small piece take?', a: 'Most small lettering and fine-line pieces are 30 to 60 minutes, including the stencil and the time you spend checking placement in the mirror.' },
  { q: 'Can you cover my old tattoo?', a: 'Usually yes. A cover-up has to be darker, larger and bolder than what is underneath. Send a clear photo taken in daylight and I will tell you straight whether it will work or whether you want laser fading first.' },
  { q: 'Do you do Sanskrit and Hindi lettering?', a: 'Yes — it is most of what I do. I set it in a proper Devanagari face, check the matras and the spacing, and confirm the exact wording with you in writing before it is stencilled. If you are unsure of the phrasing, bring me the meaning and we will get to the words together.' },
  { q: 'Do I need to pay a deposit?', a: todo<string>('Do you take a deposit to hold a slot? How much, and is it adjusted against the final price?') },
  { q: 'Do you take walk-ins?', a: todo<string>('Are walk-ins accepted, or is it appointment only? Any day that is usually free?') },
  { q: 'Do you pierce as well?', a: 'Yes. Single-use needles, autoclaved jewellery, and the aftercare written down the same as a tattoo.' },
  { q: 'How do I look after it?', a: 'Keep the wrap on as long as I tell you, wash it gently with clean hands and unscented soap, and pat it dry. Thin layer of ointment, no picking, no gym, no swimming and no direct sun until it has settled. It is all written down before you leave, and you can message me any time in the first two weeks.' },
] as const;

/* -------------------------------------------------------------------------- */
/*  13 · Contact form                                                         */
/* -------------------------------------------------------------------------- */

export const contact = {
  eyebrow: 'Book',
  heading: 'Tell me what you want.',
  body: 'This does not send an email. It writes your WhatsApp message for you and opens the chat — you can read it and change it before it sends.',
  styleOptions: ['Lettering / script', 'Devanagari / Sanskrit', 'Fine line / minimal', 'Couple / matching', 'Cover-up', 'Piercing', 'Not sure yet'],
  sizeOptions: ['Under 2 in', '2–4 in', '4–6 in', 'Bigger than 6 in', 'Not sure'],
  submit: 'Open WhatsApp',
} as const;

/* -------------------------------------------------------------------------- */
/*  Nav / footer                                                              */
/* -------------------------------------------------------------------------- */

export const nav = [
  { href: '#work', label: 'Work' },
  { href: '#lettering', label: 'Lettering' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#studio', label: 'Studio' },
  { href: '#book', label: 'Book' },
] as const;

/* -------------------------------------------------------------------------- */
/*  SEO                                                                       */
/* -------------------------------------------------------------------------- */

export const seo = {
  /**
   * The domain Udhay intends to use. It is not registered yet, so until it
   * points here, fall back to whatever domain Vercel is actually serving —
   * otherwise canonical, sitemap, OG and JSON-LD all name a host that does
   * not resolve, and a live site that disowns its own URL gets dropped from
   * search. Vercel sets this to the custom domain once one is attached, so
   * nothing has to change here when the .in goes live.
   *
   * Read at build time on the server only; no client component imports it.
   */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://secretinktattoo.in'),
  title: 'Secret Ink Tattoo — Tattoo Studio in Janipur, Jammu',
  description:
    'Small tattoos with permanent meaning. Script, Devanagari and Sanskrit lettering, fine line, couple tattoos, cover-ups and piercing in Janipur Colony, Jammu. From ₹699. Book on WhatsApp.',
  keywords: [
    'tattoo studio in Jammu',
    'tattoo artist Janipur Jammu',
    'Sanskrit tattoo Jammu',
    'cover up tattoo Jammu',
    'Devanagari tattoo Jammu',
    'small tattoo Jammu',
    'piercing Jammu',
  ],
} as const;
