/* MINI ARCHITECT — site content.
   Every figure here is taken from the creator's own live channel.
   YouTube @theminiarchitect (channel UC5ZFMTC9MF_mZarAC-JoDMA)
   Figures read on 21 September 2026: 124K subscribers · 27,456,641 views · 40 uploads.
   The channel lists a Facebook page and no website.
   The archive below covers the build films; a handful of early one-off
   experiment clips on the channel are not part of it. */

export const BRAND = {
  name: 'MINI ARCHITECT',
  tagline: 'One build. One film. Start to finish.',
  since: 2022,
  joined: 'March 4, 2022',
  statement:
    'Miniature houses, mansions, dams and bridges built from tiny bricks — ' +
    'and filmed whole, in single long-form cuts rather than clips.',
  links: {
    youtube:  'https://www.youtube.com/@theminiarchitect',
    facebook: 'https://www.facebook.com/Theminiarchitect'
  }
};

/* Headline figures — the legacy counter row. */
export const FIGURES = [
  { value: 27456641, display: '27.5', suffix: 'M', label: 'Views earned',       note: 'on the Mini Architect channel' },
  { value: 124000,   display: '124',  suffix: 'K', label: 'Subscribers',        note: 'on YouTube' },
  { value: 29,       display: '29',   suffix: '',  label: 'Build films',        note: 'no clips, no shorts' },
  { value: 9300000,  display: '9.3',  suffix: 'M', label: 'Most-watched build', note: 'one house, twenty-nine minutes' },
  { value: 6,        display: '6.5',  suffix: 'h', label: 'Of footage',         note: 'thirteen minutes a film, on average' },
  { value: 4,        display: '4',    suffix: '',  label: 'Years building',     note: 'since March 2022' }
];

/* The nine chapters of a Mini Architect build — these drive the 3D construction sequence. */
export const CHAPTERS = [
  { n: '01', k: 'site',       title: 'The Plot',       lead: 'Empty ground.',
    body: 'A bag of bricks the size of sugar cubes, a bucket of mortar, and a plot marked out on bare earth. Nothing has been cut to shape and nothing will be — the house gets built, not made.' },
  { n: '02', k: 'foundation', title: 'The Base',       lead: 'Get it level.',
    body: 'The slab goes down first and everything afterwards depends on it. Out of level here and the third course will tell on you; out of square and the roof never closes properly.' },
  { n: '03', k: 'steel',      title: 'The Ties',       lead: 'Bind it together.',
    body: 'Reinforcement worked into the base and the corners, at a scale where the wire is thinner than a bootlace. It is the part of a thirty-minute film that nobody skips to, and the part that keeps the walls honest.' },
  { n: '04', k: 'columns',    title: 'The Corners',    lead: 'Set out the frame.',
    body: 'Corners raised first and lines run between them, the way a bricklayer does it full size. From here the whole building is just following a string.' },
  { n: '05', k: 'walls',      title: 'The Brickwork',  lead: 'Course by course.',
    body: 'Thousands of tiny bricks, buttered and laid in running bond, levelled one at a time. A stunning mini house took twenty-nine minutes to film and nine million people watched the whole thing.' },
  { n: '06', k: 'floors',     title: 'The Storey',     lead: 'Span it.',
    body: 'A floor is cast and the second storey begins. This is where a house becomes a villa and where a villa becomes the three-part series the channel is known for.' },
  { n: '07', k: 'upper',      title: 'The Upper Floor', lead: 'Keep going up.',
    body: 'Balconies, terraces and the mansion’s upper rooms. The builds that hold an audience for half an hour are the ones where the shape keeps changing right to the end.' },
  { n: '08', k: 'roof',       title: 'The Roof',       lead: 'Close it in.',
    body: 'The roof goes on and the silhouette finally appears — the shape that has to carry the thumbnail, and the moment the film has been building towards since the first course.' },
  { n: '09', k: 'life',       title: 'The Finish',     lead: 'Fill the pool.',
    body: 'Render, paint, glazing, planting — and then the water. A luxury pool, a garden, a lit interior. The film does not end when the structure is done; it ends when somebody could move in.' }
];

/* Disciplines — the bodies of work, each mapped to a real category in the catalogue. */
export const DISCIPLINES = [
  { k: 'house',  name: 'Houses, Villas & Mansions',
    blurb: 'The core of the channel: mini brick houses, two-storey villas and dream mansions, filmed start to finish in one go.',
    hero: 'icdZpyhA8zM' },
  { k: 'full',   name: 'Full-Scale Builds',
    blurb: 'The same eye turned on real buildings — a modern barn house, a shipping-container home, an office rebuilt out of an old room.',
    hero: 'Dt250EnQBBg' },
  { k: 'detail', name: 'Small Brick Builds',
    blurb: 'A barbecue, a garage, a well that works, a bird house. Short films about getting one small thing exactly right.',
    hero: 'nSu4Qyr8-So' },
  { k: 'dam',    name: 'Dams',
    blurb: 'Miniature dams on remote rivers that genuinely hold and release water — the channel’s biggest departure from the house.',
    hero: 'OcYlkYBYwSQ' },
  { k: 'bridge', name: 'Bridges',
    blurb: 'The Golden Gate and Tower Bridge rebuilt in small brick, plus a working span over a creek.',
    hero: 'bBpnTrW2hXQ' },
  { k: 'water',  name: 'Pools & Water',
    blurb: 'Luxury pools dug, lined, tiled and filled — the finish that turns a structure into somewhere you would want to be.',
    hero: 'Q9R5TWAPsBs' }
];

/* The techniques index. Each one points at a build that demonstrates it,
   so the ledger is something you can use rather than just read. */
export const TECHNIQUES = [
  ['Running-bond brickwork',     'Thousands of tiny bricks, offset by half and levelled.',        'icdZpyhA8zM'],
  ['Two-storey construction',    'A cast floor and a second storey raised on finished work.',     'W7jhE3SGvL8'],
  ['Mansion planning',           'A footprint big enough that the setting-out has to be right.',  'TpBpc_5mM-Y'],
  ['Serialised builds',          'One villa across three films, picked up exactly where it left.','6atAWqFTyys'],
  ['Long-form single cuts',      'Thirty-four minutes, start to finish, nothing skipped.',        '9yKnYQnUQj4'],
  ['Stone masonry',              'The same method in mini rock rather than mini brick.',          'OF1XHwGh4MA'],
  ['Working dam walls',          'A miniature dam on a remote river that actually holds.',        'rS_y2SXOK3c'],
  ['River siting',               'Reading a real watercourse before the first block goes down.',  'La9jt5Z5ZcA'],
  ['Suspension bridge replicas', 'The Golden Gate rebuilt at miniature scale, start to finish.',  'bBpnTrW2hXQ'],
  ['Bascule bridge replicas',    'Tower Bridge in small brick, towers and roadway both.',         'vtE8suMvLIE'],
  ['Creek spans',                'A bridge built where there is actually water to cross.',        '7FZQ7Xr8YwI'],
  ['Pool excavation & lining',   'Dug, lined, tiled and filled without a leak.',                  'Q9R5TWAPsBs'],
  ['Backyard pool construction', 'The full-size version of the same sequence.',                   'WCULK_rxgp4'],
  ['Brick barbecues & ovens',    'A working fire in a structure the size of a mug.',              'nSu4Qyr8-So'],
  ['Functional well building',   'A mini well with a mechanism that draws.',                      'yKpyRYX2IA0'],
  ['Timber cabin work',          'A log cabin lake house, built stick by stick.',                 'A243SKiY6TE']
];

/* The journey. */
export const TIMELINE = [
  { year: '2022', title: 'The channel opens',
    body: 'Mini Architect is registered on 4 March 2022. The format is set early and never really changes: one build, one film, start to finish, no narration.' },
  { year: 'Early', title: 'Small things, done properly',
    body: 'A barbecue, a garage, a bird house, a well that draws water. Short films about getting one component exactly right before attempting a whole building.' },
  { year: 'Houses', title: 'The first full builds',
    body: 'Complete mini brick houses, filmed end to end. The long-form cut turns out to be the point — people stay for all of it.' },
  { year: 'Breakthrough', title: 'Twenty-nine minutes, nine million views',
    body: 'A stunning mini house built entirely from small bricks becomes the channel’s defining film: half an hour of bricklaying, watched to the end by nine million people.' },
  { year: 'Bigger', title: 'Mansions and series',
    body: 'A dream mansion, then a villa with a pool split across three episodes. The builds outgrow a single sitting and the audience follows anyway.' },
  { year: 'Beyond', title: 'Dams, bridges, real buildings',
    body: 'Working dams on remote rivers, the Golden Gate and Tower Bridge in small brick, and full-scale films about a barn house and a container home.' },
  { year: '2026', title: 'Twenty-seven million, one film at a time',
    body: 'Twenty-nine build films, six and a half hours of footage, and an audience of a hundred and twenty-four thousand who came for the whole thing rather than the highlights.' }
];

export const PLATFORMS = [
  { k: 'youtube',  name: 'YouTube',  handle: '@theminiarchitect', stat: '124K', statLabel: 'subscribers',
    extra: '27.5M views · 40 uploads · since March 2022', url: BRAND.links.youtube },
  { k: 'facebook', name: 'Facebook', handle: '/Theminiarchitect', stat: 'Builds', statLabel: 'and updates',
    extra: 'The channel’s only other home', url: BRAND.links.facebook }
];

/* The three builds that play on loop in the "In motion" band. */
export const MOTION = ['icdZpyhA8zM', 'W7jhE3SGvL8', 'OcYlkYBYwSQ'];

/* The four stills in the craft column. */
export const STACK = ['TpBpc_5mM-Y', 'bBpnTrW2hXQ', 'Q9R5TWAPsBs', 'rS_y2SXOK3c'];

export const FILTERS = [
  { k: 'all',    label: 'All work' },
  { k: 'house',  label: 'Houses & Mansions' },
  { k: 'full',   label: 'Full-Scale Builds' },
  { k: 'detail', label: 'Small Brick Builds' },
  { k: 'dam',    label: 'Dams' },
  { k: 'bridge', label: 'Bridges' },
  { k: 'water',  label: 'Pools & Water' }
];
