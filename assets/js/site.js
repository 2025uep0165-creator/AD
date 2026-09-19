/* VFUHO — site content.
   Every figure here is taken from the creator's own live channels.
   YouTube @vfuhoo · Instagram @vfuho_ · TikTok @vfuho_ · Facebook /vfuho */

export const BRAND = {
  name: 'VFUHO',
  tagline: 'Miniature houses, built entirely from mini bricks.',
  since: 2020,
  joined: 'October 6, 2020',
  statement:
    'VFUHO brings you miniature houses built entirely from mini bricks, crafted with incredible detail and precision.',
  links: {
    youtube:   'https://youtube.com/@vfuhoo',
    instagram: 'https://www.instagram.com/vfuho_',
    tiktok:    'https://www.tiktok.com/@vfuho_',
    facebook:  'https://www.facebook.com/vfuho'
  }
};

/* Headline figures — the legacy counter row. */
export const FIGURES = [
  { value: 2203584885, display: '2.2', suffix: 'B', label: 'Views earned',        note: 'across the VFUHO channel' },
  { value: 3730000,    display: '3.73', suffix: 'M', label: 'Subscribers',        note: 'on YouTube' },
  { value: 2000000,    display: '2.0',  suffix: 'M', label: 'Followers',          note: 'on Instagram' },
  { value: 131,        display: '131',  suffix: '',  label: 'Houses filmed',      note: 'every one built by hand' },
  { value: 16300000,   display: '16.3', suffix: 'M', label: 'Likes',              note: 'on TikTok' },
  { value: 6,          display: '6',    suffix: '',  label: 'Years of building',  note: 'since October 2020' }
];

/* The nine chapters of a VFUHO build — these drive the 3D construction sequence. */
export const CHAPTERS = [
  { n: '01', k: 'site',       title: 'The Site',        lead: 'Nothing.',
    body: 'Every house begins as bare ground and an idea. A rectangle scratched into the earth, a pile of bricks no bigger than a fingernail, and the patience to see the whole thing finished before a single one is laid.' },
  { n: '02', k: 'foundation', title: 'The Foundation',  lead: 'Dig. Level. Pour.',
    body: 'Footings first, then the slab. VFUHO builds the parts nobody sees with the same care as the parts everybody photographs — because a miniature house that cannot stand is only a sculpture.' },
  { n: '03', k: 'steel',      title: 'The Steel',       lead: 'Tie every joint.',
    body: 'Rebar cages bent and tied by hand at a scale where a single wire is thinner than a matchstick. This is the detail that separates a model from a building.' },
  { n: '04', k: 'columns',    title: 'The Columns',     lead: 'Find the load.',
    body: 'Y-pillars. V-pillars. Five columns, seven columns, one single impossible stem. The column is where VFUHO stops copying houses and starts inventing them.' },
  { n: '05', k: 'walls',      title: 'The Walls',       lead: 'Course by course.',
    body: 'Thousands of mini bricks, laid in running bond, mortared and levelled one at a time. Openings left for doors and windows that will later actually open.' },
  { n: '06', k: 'floors',     title: 'The Floors',      lead: 'Pour the deck.',
    body: 'A slab spans the ground storey and the house gains a second life above it. Stairs are cast, treads are measured, and the geometry has to be right the first time.' },
  { n: '07', k: 'upper',      title: 'The Upper Storey', lead: 'Push past safe.',
    body: 'Cantilevers over open air. Offset volumes. Balconies that hang with nothing beneath them. The builds people cannot look away from are the ones that look like they should fall.' },
  { n: '08', k: 'roof',       title: 'The Roof',        lead: 'Close it in.',
    body: 'The roof deck goes on and the silhouette finally appears — the shape that will live in a thumbnail seen a hundred million times.' },
  { n: '09', k: 'life',       title: 'The Life',        lead: 'Switch it on.',
    body: 'Water runs through real plumbing. A pump fills a pool. Lights come on behind glass. Trees go in. The house stops being a build and starts being a home.' }
];

/* Disciplines — the six bodies of work, each mapped to a real category in the catalogue. */
export const DISCIPLINES = [
  { k: 'foundation', name: 'Foundations & Groundwork',
    blurb: 'Footings, slabs, rebar cages, steel ties and hand-mixed concrete. The invisible half of every build.',
    hero: 'ERlHN7Vie1k' },
  { k: 'structure',  name: 'Pillars & Impossible Structures',
    blurb: 'Cantilevers, cliffsides, twisted columns and houses balanced on a single stem. Where the engineering becomes the story.',
    hero: 'cipdD8qpHVY' },
  { k: 'house',      name: 'Villas & Dream Houses',
    blurb: 'Two storeys, three storeys, Scandinavian, modern, rustic stone. The finished houses that made the channel.',
    hero: 'FtHoM7j22JA' },
  { k: 'water',      name: 'Water, Power & Machinery',
    blurb: 'Working pumps, filled pools, fish ponds, ventilation fans, automatic doors and flood-proof foundations.',
    hero: 'Rh6UxFUCVW8' },
  { k: 'bridge',     name: 'Bridges',
    blurb: 'Concrete decks, lit spans and load tests. Proof that the craft travels beyond the house.',
    hero: 'mzAB18R6ucY' },
  { k: 'detail',     name: 'Stairs, Roofs & Detail',
    blurb: 'Cast staircases, poured roof decks, painted façades, planted gardens. The last ten per cent that takes half the time.',
    hero: 'St_LeDdU6Ys' }
];

/* The techniques index — a blueprint-style ledger of the craft. */
export const TECHNIQUES = [
  ['Running-bond brickwork',      'Every wall laid course by course, offset by half a brick.'],
  ['Hand-tied rebar cages',       'Steel bent, cut and wired before a single pour.'],
  ['Reinforced concrete slabs',   'Ground decks, floor decks and roof decks, cast in place.'],
  ['Pillar & pile foundations',   'Raised houses on five, seven or a single central stem.'],
  ['Flood-resistant groundwork',  'Elevated structures engineered against rising water.'],
  ['Cantilevered volumes',        'Upper storeys projected over open air, unsupported.'],
  ['Twisted & V-form columns',    'Geometry that bends the brick out of the vertical.'],
  ['Cast concrete staircases',    'Treads and risers formed, poured and struck by hand.'],
  ['Working plumbing systems',    'Tanks, pipes and pumps that genuinely move water.'],
  ['Integrated lighting',         'Wired interiors and lit bridge spans.'],
  ['Mechanised doors',            'Automatic openings driven by miniature actuators.'],
  ['Ventilated basements',        'Underground parking with functioning airflow.'],
  ['Glazing & façade painting',   'Finishing passes that set the character of the house.'],
  ['Landscaping & planting',      'Trees, gardens and grounds that complete the scene.'],
  ['Scaffolding at scale',        'Miniature access systems for upper-storey work.'],
  ['Stone & granite masonry',     'Rustic builds in cut stone as well as brick.']
];

/* The journey. */
export const TIMELINE = [
  { year: '2020', title: 'The channel opens',
    body: 'VFUHO is founded on 6 October 2020 with a single idea: build real houses, at miniature scale, out of mini bricks — and show every step.' },
  { year: 'Early', title: 'Learning the material',
    body: 'One-storey houses in brick and stone. Foundations, pillars and the first stair sets. The vocabulary of the craft gets assembled piece by piece.' },
  { year: 'Upward', title: 'Two storeys and a pool',
    body: 'The builds grow upward. Swimming pools, pumps and plumbing arrive, and the houses begin to do things as well as be things.' },
  { year: 'Breakthrough', title: 'Patience finds its audience',
    body: 'A step-by-step column tutorial becomes one of the most-watched things on the channel — proof that precision travels further than spectacle.' },
  { year: 'The record', title: 'Brick against brick',
    body: 'A T-shaped two-storey house, mini bricks set against plastic blocks, becomes the single most-watched build in the archive.' },
  { year: 'Lately', title: 'Engineering as the story',
    body: 'Flood-proof foundations, cantilevers, cliffside houses and lit bridges. The work becomes unmistakably architectural.' },
  { year: '2026', title: 'Two billion and building',
    body: 'Over 2.2 billion views, 3.73 million subscribers and 131 finished houses. The archive keeps growing, one brick at a time.' }
];

export const PLATFORMS = [
  { k: 'youtube',   name: 'YouTube',   handle: '@vfuhoo',  stat: '3.73M', statLabel: 'subscribers',
    extra: '2.2B views · 131 uploads', url: BRAND.links.youtube },
  { k: 'instagram', name: 'Instagram', handle: '@vfuho_',  stat: '2.0M',  statLabel: 'followers',
    extra: '143 posts', url: BRAND.links.instagram },
  { k: 'tiktok',    name: 'TikTok',    handle: '@vfuho_',  stat: '1.3M',  statLabel: 'followers',
    extra: '16.3M likes · 108 videos', url: BRAND.links.tiktok },
  { k: 'facebook',  name: 'Facebook',  handle: '/vfuho',   stat: 'Daily', statLabel: 'builds',
    extra: 'Full-length process films', url: BRAND.links.facebook }
];

/* The three builds that play on loop in the "In motion" band. */
export const MOTION = ['FtHoM7j22JA', '6JvWS-m-JsU', 'Rh6UxFUCVW8'];

export const FILTERS = [
  { k: 'all',        label: 'All work' },
  { k: 'house',      label: 'Villas & Houses' },
  { k: 'structure',  label: 'Pillars & Structures' },
  { k: 'foundation', label: 'Foundations' },
  { k: 'water',      label: 'Water & Power' },
  { k: 'detail',     label: 'Stairs & Detail' },
  { k: 'bridge',     label: 'Bridges' }
];
