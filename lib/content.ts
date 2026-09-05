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
/*  Media placeholders                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Every media slot works the same way. While `src` is null the component draws
 * a plate — fine ink linework on bone, in the real 4:5 crop — so the layout is
 * never broken and never pretends a photograph exists. Drop a file in /public
 * and set `src`; nothing else changes.
 */
export type Media = {
  src: string | null;
  alt: string;
  /** Which line motif to draw while src is null. See components/Plate.tsx */
  plate: PlateKey;
  /** What to send Udhay for. Shown in the dev TODO panel. */
  need: string;
};

export type PlateKey =
  | 'om'
  | 'trishul'
  | 'shloka'
  | 'script'
  | 'heartbeat'
  | 'bird'
  | 'hourglass'
  | 'sun'
  | 'deer'
  | 'floral'
  | 'couple'
  | 'coverup'
  | 'needle'
  | 'portrait';

const media = (plate: PlateKey, alt: string, need: string): Media => ({
  src: null,
  alt,
  plate,
  need,
});

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
    poster: {
      src: '/images/hand-mandala.jpg',
      alt: 'A dotwork mandala tattooed across the back of a hand, freshly finished',
      plate: 'needle' as PlateKey,
      need: 'A 6–8s hero clip would replace this still.',
    },
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
  lines: ['JUST ONE', 'LIFE.'],
  caption: 'Inner forearm · 4 in · one sitting',
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
export const filters = [
  { id: 'all', label: 'All' },
  { id: 'lettering', label: 'Lettering & Script' },
  { id: 'devotional', label: 'Devotional' },
  { id: 'fineline', label: 'Fine Line' },
  { id: 'couple', label: 'Couple' },
  { id: 'coverup', label: 'Cover-ups' },
] as const;

export type FilterId = (typeof filters)[number]['id'];

export type Work = {
  id: string;
  category: Exclude<FilterId, 'all'>;
  title: string;
  placement: string;
  size: string;
  session: string;
  image: Media;
};

/**
 * 15–20 originals needed, weighted to lettering and Devanagari.
 * Shot straight on, not through cling film, daylight if possible.
 */
export const work: Work[] = [
  {
    id: 'w01',
    category: 'lettering',
    title: '“Just One Life”',
    placement: 'Inner forearm',
    size: '4 in',
    session: '45 min',
    image: media('script', 'Fine script lettering reading “Just One Life” on an inner forearm', 'Original of the “Just One Life” forearm script.'),
  },
  {
    id: 'w00',
    category: 'devotional',
    title: 'Mandala',
    placement: 'Back of hand',
    size: '4 in',
    session: '3 hr',
    image: {
      src: '/images/hand-mandala.jpg',
      alt: 'A dotwork mandala tattooed across the back of a hand',
      plate: 'om' as PlateKey,
      need: '',
    },
  },
  {
    id: 'w02',
    category: 'devotional',
    title: 'ॐ',
    placement: 'Back of neck',
    size: '1.5 in',
    session: '30 min',
    image: media('om', 'A small Om symbol tattooed at the back of the neck', 'Original of the nape Om.'),
  },
  {
    id: 'w03',
    category: 'lettering',
    title: 'Name with heartbeat',
    placement: 'Wrist',
    size: '3 in',
    session: '40 min',
    image: media('heartbeat', 'A name in script joined to a heartbeat line, tattooed on a wrist', 'Original of a name-and-heartbeat wrist piece.'),
  },
  {
    id: 'w04',
    category: 'devotional',
    title: 'त्रिशूल',
    placement: 'Forearm',
    size: '5 in',
    session: '1 hr',
    image: media('trishul', 'A trishul tattooed along the forearm', 'Original of the forearm trishul.'),
  },
  {
    id: 'w05',
    category: 'fineline',
    title: 'Birds in flight',
    placement: 'Collarbone',
    size: '2.5 in',
    session: '35 min',
    image: media('bird', 'Three small fine-line birds in flight across a collarbone', 'Original of the collarbone birds.'),
  },
  {
    id: 'w06',
    category: 'devotional',
    title: 'हर हर महादेव',
    placement: 'Upper back',
    size: '7 in',
    session: '2 hr',
    image: media('shloka', 'Har Har Mahadev in Devanagari lettering across an upper back', 'Original of the Har Har Mahadev back piece.'),
  },
  {
    id: 'w07',
    category: 'fineline',
    title: 'Hourglass',
    placement: 'Inner arm',
    size: '3 in',
    session: '1 hr',
    image: media('hourglass', 'A fine-line hourglass tattooed on an inner arm', 'Original of the hourglass.'),
  },
  {
    id: 'w08',
    category: 'couple',
    title: 'Matching initials',
    placement: 'Ring finger, both hands',
    size: '0.5 in each',
    session: '30 min for the pair',
    image: media('couple', 'Matching initials tattooed on the ring fingers of a couple', 'Original of a matching couple piece.'),
  },
  {
    id: 'w09',
    category: 'lettering',
    title: '“Believe”',
    placement: 'Side wrist',
    size: '2.5 in',
    session: '30 min',
    image: media('script', 'The word Believe in fine script on a side wrist', 'Original of the “Believe” wrist script.'),
  },
  {
    id: 'w10',
    category: 'fineline',
    title: 'Rising sun',
    placement: 'Shoulder',
    size: '3 in',
    session: '50 min',
    image: media('sun', 'A fine-line rising sun tattooed on a shoulder', 'Original of the sun.'),
  },
  {
    id: 'w11',
    category: 'coverup',
    title: 'Old name, covered',
    placement: 'Forearm',
    size: '6 in',
    session: '2.5 hr',
    image: media('coverup', 'A dense blackwork design covering an older name tattoo on a forearm', 'Original of a finished cover-up.'),
  },
  {
    id: 'w12',
    category: 'lettering',
    title: '“Patience”',
    placement: 'Forearm',
    size: '4 in',
    session: '45 min',
    image: media('script', 'The word Patience in fine script along a forearm', 'Original of the “Patience” piece.'),
  },
  {
    id: 'w13',
    category: 'fineline',
    title: 'Deer',
    placement: 'Calf',
    size: '4 in',
    session: '1 hr 15 min',
    image: media('deer', 'A fine-line deer tattooed on a calf', 'Original of the deer.'),
  },
  {
    id: 'w14',
    category: 'devotional',
    title: 'Shloka band',
    placement: 'Forearm band',
    size: '8 in',
    session: '2 hr 30 min',
    image: media('shloka', 'A Sanskrit shloka tattooed as a band around a forearm', 'Original of the shloka band.'),
  },
  {
    id: 'w15',
    category: 'fineline',
    title: 'Small florals',
    placement: 'Ankle',
    size: '2 in',
    session: '35 min',
    image: media('floral', 'A small fine-line floral sprig tattooed on an ankle', 'Original of the ankle florals.'),
  },
  {
    id: 'w16',
    category: 'couple',
    title: 'Date, matching',
    placement: 'Inner forearm, both',
    size: '2 in each',
    session: '40 min for the pair',
    image: media('couple', 'A matching date tattooed in fine numerals on two inner forearms', 'Original of a matching date pair.'),
  },
];

/* -------------------------------------------------------------------------- */
/*  5 · Reels                                                                 */
/* -------------------------------------------------------------------------- */

export type Reel = {
  id: string;
  caption: string;
  poster: Media;
  src: Field<string>;
};

/** Self-hosted MP4s. Never IG embeds — they are slow and they break. */
export const reels: Reel[] = [
  { id: 'r1', caption: 'Stencil, checked twice', poster: media('script', 'Stencil being placed on a forearm', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 1 MP4 — stencil placement.') },
  { id: 'r2', caption: 'Outlining a shloka', poster: media('shloka', 'Outlining Devanagari lettering', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 2 MP4 — Devanagari outline.') },
  { id: 'r3', caption: 'Fine line, single pass', poster: media('bird', 'A fine line being pulled in one pass', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 3 MP4 — fine line.') },
  { id: 'r4', caption: 'Cover-up, hour three', poster: media('coverup', 'A cover-up in progress', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 4 MP4 — cover-up progress.') },
  { id: 'r5', caption: 'Fresh, wrapped', poster: media('heartbeat', 'A finished tattoo being wrapped', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 5 MP4 — wrapping.') },
  { id: 'r6', caption: 'Piercing, sterile field', poster: media('needle', 'A sterile piercing setup', 'Vertical 9:16 clip, 5–8s, muted.'), src: todo('Reel 6 MP4 — piercing setup.') },
];

/* -------------------------------------------------------------------------- */
/*  6 · Cover-up before / after                                               */
/* -------------------------------------------------------------------------- */

export const coverUp = {
  eyebrow: 'Cover-ups',
  heading: 'The one you regret is not permanent.',
  body: 'Most cover-ups are possible. Darker, bigger and bolder than the original — that is the trade. Send a clear photo in daylight and I will tell you honestly whether it will work, and what it will take.',
  before: media('script', 'A faded older name tattoo on a forearm before the cover-up', 'The BEFORE photo of one cover-up. Same angle, same distance as the after.'),
  after: media('coverup', 'The same forearm after a bold blackwork cover-up', 'The AFTER photo of the same cover-up. Same angle, same distance.'),
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

export const process = {
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
    src: '/images/udhay.jpg',
    alt: 'Udhay, the artist behind Secret Ink Tattoo',
    plate: 'portrait' as PlateKey,
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
  siteUrl: 'https://secretinktattoo.in',
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
  /** OG image is the Devanagari piece — this is what renders in a WhatsApp share. */
  ogImageNeed: 'Best Devanagari piece, 1200×630 safe crop, for the WhatsApp/OG share card.',
} as const;
