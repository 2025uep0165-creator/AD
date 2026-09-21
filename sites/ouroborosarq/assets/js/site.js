/* OUROBOROS ARQ — site content.
   Every figure here is taken from the creator's own live channel.
   YouTube @OUROBOROS-ARQ192 (channel UCZlwM3g-F6AkdIZqNBlrPww)
   Figures read on 21 September 2026: 3.06M subscribers · 633,306,192 views · 278 uploads.
   The channel lists no website and no other social accounts. */

export const BRAND = {
  name: 'OUROBOROS ARQ',
  tagline: 'Architecture at one-twentieth scale, built the way the real thing is built.',
  since: 2017,
  joined: 'July 21, 2017',
  statement:
    'Reinforced concrete, masonry and timber — modelled at miniature scale with the ' +
    'sequence, the materials and the tolerances of a real building site.',
  links: {
    youtube: 'https://www.youtube.com/@OUROBOROS-ARQ192'
  }
};

/* Headline figures — the legacy counter row. */
export const FIGURES = [
  { value: 633306192, display: '633', suffix: 'M', label: 'Views earned',       note: 'on the OUROBOROS ARQ channel' },
  { value: 3060000,   display: '3.06', suffix: 'M', label: 'Subscribers',       note: 'on YouTube' },
  { value: 277,       display: '277',  suffix: '',  label: 'Builds filmed',     note: 'foundation to finish' },
  { value: 94000000,  display: '94',   suffix: 'M', label: 'Most-watched build', note: 'a house, in ten steps' },
  { value: 15,        display: '15.7', suffix: 'h', label: 'Of footage',        note: 'every stage kept in' },
  { value: 9,         display: '9',    suffix: '',  label: 'Years on site',     note: 'since July 2017' }
];

/* The nine chapters of an OUROBOROS ARQ build — these drive the 3D construction sequence. */
export const CHAPTERS = [
  { n: '01', k: 'site',       title: 'The Plot',        lead: 'Set it out.',
    body: 'A rectangle marked on bare ground, squared off the diagonal. Before a single brick is cut, the whole building already exists — drawn, dimensioned and sequenced, exactly the way an architect would hand it to a site foreman.' },
  { n: '02', k: 'foundation', title: 'The Cimientos',   lead: 'Dig. Tie. Pour.',
    body: 'Footings excavated, strip foundations formed, concrete mixed and poured wet. OUROBOROS ARQ has filmed the foundation stage more than two dozen separate times, because it is the stage that decides whether everything above it is architecture or decoration.' },
  { n: '03', k: 'steel',      title: 'The Armadura',    lead: 'Steel before stone.',
    body: 'Stirrups bent, cages tied, laps overlapped. Every column and every slab on this channel carries real reinforcement at scale — not because the model needs it, but because a reinforced concrete building is the thing being explained.' },
  { n: '04', k: 'columns',    title: 'The Columnas',    lead: 'Cast them standing.',
    body: 'Formwork boxed around the cage, concrete poured, the box struck a day later. The column videos are the channel’s signature: one of them has been watched thirty-one million times, and it is four minutes of a man doing it properly.' },
  { n: '05', k: 'walls',      title: 'The Mampostería', lead: 'Course upon course.',
    body: 'Miniature brick laid in running bond, buttered, levelled, pointed. Openings formed as the wall rises rather than cut afterwards — the difference between masonry and carving, and the reason the walls read as real at any distance.' },
  { n: '06', k: 'floors',     title: 'The Losa',        lead: 'Span it.',
    body: 'A reinforced slab is formed, propped and poured over the ground storey. Stairs are cast in the same pour where the geometry allows. From here the building stops being a plan and starts being a section.' },
  { n: '07', k: 'upper',      title: 'The Second Level', lead: 'Build on your own work.',
    body: 'Second storey, then third. The channel has filmed a mini home growing level by level over successive videos, each one loading the structure underneath it exactly as a real sequence would.' },
  { n: '08', k: 'roof',       title: 'The Tejado',      lead: 'Close it in.',
    body: 'Timber roof structure, or a poured deck, depending on the building. This is where OUROBOROS ARQ’s two vocabularies — concrete and carpentry — end up in the same model, joined the way they would be on site.' },
  { n: '09', k: 'life',       title: 'The Acabados',    lead: 'Finish it.',
    body: 'Plaster, ceramic floors, paint, glazing, wiring, paving, planting. The last ten per cent takes half the time, and it is the part that turns a structure into a building somebody could live in.' }
];

/* Disciplines — six bodies of work, each mapped to a real category in the catalogue. */
export const DISCIPLINES = [
  { k: 'concrete',   name: 'Reinforced Concrete',
    blurb: 'Columns, slabs, beams, towers and stirrup cages. The structural core of the channel and the subject of its most-watched films.',
    hero: 'CbQfMkwtxwY' },
  { k: 'masonry',    name: 'Bricklaying & Mampostería',
    blurb: 'Running-bond brickwork, plastering, rendering and pointing — laid course by course, in Spanish and in English.',
    hero: '_VHSDhzlhiU' },
  { k: 'finish',     name: 'Finishes & Grounds',
    blurb: 'Cast staircases, ceramic floors, paint, paving, gardens and wiring. The passes that decide whether the model reads as a home.',
    hero: 'kPkg-op1vy0' },
  { k: 'foundation', name: 'Foundations & Groundwork',
    blurb: 'Excavation, footings, strip foundations and slabs on grade. The half of every build that will never be photographed.',
    hero: 'mALTsnF2XRU' },
  { k: 'timber',     name: 'Timber & Roofing',
    blurb: 'Stud framing, wooden floors, trusses and tiled roofs — the carpenter’s half of the same building.',
    hero: 'Fbe7_UzylgE' },
  { k: 'landmark',   name: 'Landmarks & Replicas',
    blurb: 'A McDonald’s drive-thru, a KFC, a Mac store, a five-storey tower. Real buildings rebuilt in miniature reinforced concrete.',
    hero: 'm_JOpjEhnvY' },
  { k: 'bridge',     name: 'Bridges',
    blurb: 'Reinforced concrete spans, abutments and decks. Proof that the method travels beyond the house.',
    hero: 'Tu_Q99VhcnM' }
];

/* The techniques index. Each one points at a build that demonstrates it,
   so the ledger is something you can use rather than just read. */
export const TECHNIQUES = [
  ['Strip foundations',          'Footings excavated, formed and poured before anything rises.',   'mALTsnF2XRU'],
  ['Hand-tied stirrup cages',    'Steel bent, lapped and wired for every column.',                 '3Gsr1aWlSBI'],
  ['Cast-in-place columns',      'Formwork boxed, poured wet, struck the next day.',               'rvrsH5o_pGE'],
  ['Reinforced concrete slabs',  'Propped decks poured over the storey below.',                    'wHubkrR3Rc4'],
  ['Lightweight slab casting',   'A thinner pour for spans that would otherwise be too heavy.',    'BIFLbKGzlcM'],
  ['Running-bond brickwork',     'Every wall offset by half a brick, buttered and levelled.',      'e3DOEH1-k3Q'],
  ['Plastering & rendering',     'Wet render floated flat over raw masonry.',                      'R83K5vaUsAk'],
  ['Cast concrete staircases',   'Treads and risers formed, poured and struck by hand.',           'kPkg-op1vy0'],
  ['Timber stud framing',        'Stud walls set out, plated and braced in miniature.',            '0EGkYi_rewI'],
  ['Pitched roof construction',  'Rafters, battens and tile, cut to a real pitch.',                '2Hm1H4aGies'],
  ['Ceramic tiling',             'Floor and wall tile bedded, spaced and grouted.',                'PLYgx6fKq80'],
  ['Wood floors & wiring',       'Boards laid over joists with the electrics run underneath.',     'Egf-WM2k8mw'],
  ['Cobblestone & paving',       'A thousand pavers bedded in a single pass.',                     'xT42Stj5trE'],
  ['Multi-storey sequencing',    'Second and third levels built onto finished work.',              'jgY1WCz_DFs'],
  ['Garden & landscaping',       'Planting, terraces and pergolas that finish the plot.',          'iDWt7BzXyc4'],
  ['Controlled demolition',      'A reinforced house taken down by wrecking ball, in slow motion.','N-ygsvPCuh4']
];

/* The journey. */
export const TIMELINE = [
  { year: '2017', title: 'The channel opens',
    body: 'OUROBOROS ARQ is registered on 21 July 2017. The premise is narrow and unusual: explain real construction by building it small, correctly, and filming every stage.' },
  { year: 'Early', title: 'Mampostería, in two languages',
    body: 'Brick walls, columns and footings, titled in Spanish and English at once. The bilingual titling turns a local how-to channel into something people follow from anywhere.' },
  { year: 'Concrete', title: 'Reinforcement becomes the subject',
    body: 'Stirrup cages, formwork and wet pours move to the centre of the work. A four-minute column video finds fifty-four million views by doing nothing except the job, properly.' },
  { year: 'Scale', title: 'One house, ten steps',
    body: 'A full house condensed into ten sequenced stages becomes the most-watched film on the channel — ninety-four million views for a complete build, start to finish.' },
  { year: 'Landmarks', title: 'Buildings people recognise',
    body: 'A McDonald’s drive-thru, a KFC, a Mac store. Familiar architecture rebuilt in reinforced concrete at scale, which puts the method in front of an audience that never searched for masonry.' },
  { year: 'Timber', title: 'The second vocabulary',
    body: 'Stud framing, wooden floors and pitched roofs join the concrete work. The channel can now build the same house two ways and show why each one is detailed as it is.' },
  { year: '2026', title: '633 million and still pouring',
    body: 'Two hundred and seventy-seven builds, more than fifteen hours of footage, and an audience of three million who came to watch somebody tie steel carefully.' }
];

export const PLATFORMS = [
  { k: 'youtube', name: 'YouTube', handle: '@OUROBOROS-ARQ192', stat: '3.06M', statLabel: 'subscribers',
    extra: '633M views · 278 uploads · since July 2017', url: BRAND.links.youtube }
];

/* The three builds that play on loop in the "In motion" band. */
export const MOTION = ['CbQfMkwtxwY', '_VHSDhzlhiU', 'Tu_Q99VhcnM'];

export const FILTERS = [
  { k: 'all',        label: 'All work' },
  { k: 'concrete',   label: 'Reinforced Concrete' },
  { k: 'masonry',    label: 'Bricklaying' },
  { k: 'finish',     label: 'Finishes & Grounds' },
  { k: 'foundation', label: 'Foundations' },
  { k: 'timber',     label: 'Timber & Roofing' },
  { k: 'landmark',   label: 'Landmarks' },
  { k: 'bridge',     label: 'Bridges' }
];

/* The four stills in the craft column. */
export const STACK = ['rvrsH5o_pGE', 'wHubkrR3Rc4', 'e3DOEH1-k3Q', 'Tu_Q99VhcnM'];
