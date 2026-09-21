/* MINI CONSTRUCTION — site content.
   Every figure here is taken from the creator's own live channel.
   YouTube @Chien-Tran (channel UCyCCJFzPLNzBSCttyXP3mpg)
   Figures read on 21 September 2026: 297K subscribers · 70,312,232 views · 178 uploads.
   The channel lists no website and no other social accounts. */

export const BRAND = {
  name: 'MINI CONSTRUCTION',
  tagline: 'Miniature civil engineering that actually generates.',
  since: 2011,
  joined: 'October 11, 2011',
  statement:
    'Dams, turbines and powerhouses built at miniature scale on real streams — ' +
    'and wired to put real mains voltage on the line.',
  links: {
    youtube: 'https://www.youtube.com/@Chien-Tran'
  }
};

/* Headline figures — the legacy counter row. */
export const FIGURES = [
  { value: 70312232, display: '70.3', suffix: 'M', label: 'Views earned',      note: 'on the Mini Construction channel' },
  { value: 297000,   display: '297',  suffix: 'K', label: 'Subscribers',       note: 'on YouTube' },
  { value: 170,      display: '170',  suffix: '',  label: 'Projects filmed',   note: 'stream to switchboard' },
  { value: 220,      display: '220',  suffix: 'V', label: 'On the line',       note: 'mains voltage, at model scale' },
  { value: 45,       display: '45.2', suffix: 'h', label: 'Of footage',        note: 'some builds run past an hour' },
  { value: 15,       display: '15',   suffix: '',  label: 'Years on the water', note: 'since October 2011' }
];

/* The nine chapters of a Mini Construction build — these drive the 3D construction sequence. */
export const CHAPTERS = [
  { n: '01', k: 'site',       title: 'The Stream',      lead: 'Read the water.',
    body: 'Every project starts at a real watercourse with a real fall. Before anything is built, the head is judged, the flow is judged, and the question is answered: how much power is actually in this water?' },
  { n: '02', k: 'foundation', title: 'The Diversion',   lead: 'Move the river.',
    body: 'The stream is blocked and turned aside so the work can happen in the dry. Excavation follows, down to something solid — because a structure that will hold back water cannot be founded on the silt the water put there.' },
  { n: '03', k: 'steel',      title: 'The Reinforcement', lead: 'Tie it before you pour.',
    body: 'Steel bent and wired into the footings, the wall and the intake. Water finds every weakness eventually, and the reinforcement is the reason the wall is still standing after the reservoir is full.' },
  { n: '04', k: 'columns',    title: 'The Structure',   lead: 'Stand it up.',
    body: 'Piers, abutments and the powerhouse frame. The geometry has to carry both the building above and the thrust of everything the dam is holding back — curved walls where the span demands it, straight where it does not.' },
  { n: '05', k: 'walls',      title: 'The Dam Wall',    lead: 'Hold the water.',
    body: 'Course by course, the wall closes the gap. Gates are formed as it rises — four, six, sometimes more — because a dam that cannot be opened is a dam that will eventually be destroyed by its own reservoir.' },
  { n: '06', k: 'floors',     title: 'The Powerhouse',  lead: 'Make a room for it.',
    body: 'A deck is poured and the machine hall takes shape below the crest. This is where the penstock arrives, where the runner sits, and where everything stops being masonry and starts being machinery.' },
  { n: '07', k: 'upper',      title: 'The Turbine',     lead: 'Catch the fall.',
    body: 'Francis runners, screw turbines, overshot wheels — one built out of a broken bicycle wheel. Blade angle, shaft alignment and clearance are the whole game, and the channel has filmed two dozen different answers to it.' },
  { n: '08', k: 'roof',       title: 'The Wiring',      lead: 'Close it in.',
    body: 'Generator coupled, roof on, cable run out to the board. One hundred and twenty volts, then two hundred and twenty — the number on the meter is the only review that matters.' },
  { n: '09', k: 'life',       title: 'The Flood',       lead: 'Open the gates.',
    body: 'The diversion comes out and the reservoir fills. Water goes over the crest, through the gates, into the runner — and the lights come on. Nothing about this stage is simulated.' }
];

/* Disciplines — the bodies of work, each mapped to a real category in the catalogue. */
export const DISCIPLINES = [
  { k: 'hydro',   name: 'Hydroelectric Plants',
    blurb: 'Complete stations, from intake to switchboard, putting 120V and 220V on the line from a stream in the hills.',
    hero: 'usOWKYTo7k0' },
  { k: 'dam',     name: 'Dams & Water Control',
    blurb: 'Curved and straight walls, four gates or six, spillways and discharge. The half of the job that holds everything else up.',
    hero: 'ILMIUPRLi0M' },
  { k: 'house',   name: 'Houses & Buildings',
    blurb: 'Modern two-storey homes, little riverside houses and working lifts — built with the same patience as the dams.',
    hero: 'wxEv3snzc-Y' },
  { k: 'turbine', name: 'Turbines & Generators',
    blurb: 'Francis runners, screw turbines, hexagonal suction wheels and a waterwheel made from a bicycle rim.',
    hero: 'jNCivw94vBo' },
  { k: 'bridge',  name: 'Bridges',
    blurb: 'Road decks, mixed rail-and-road spans and a working swing bridge. Civil engineering beyond the powerhouse.',
    hero: 'up3DVaqjeG8' },
  { k: 'works',   name: 'Earthworks & Machines',
    blurb: 'Roads cut with miniature excavators and rollers, ponds renovated, water carried to crops and fish.',
    hero: 'dwWGsgMzbps' }
];

/* The techniques index. Each one points at a build that demonstrates it,
   so the ledger is something you can use rather than just read. */
export const TECHNIQUES = [
  ['Stream diversion',           'Blocking and turning a live watercourse to work in the dry.',    'gRwtMFAvZf0'],
  ['Curved dam walls',           'An arch that carries reservoir thrust into the abutments.',      'ILMIUPRLi0M'],
  ['Multi-gate discharge',       'Six gates formed into the wall and opened under load.',          'AcWAaoiRWHo'],
  ['Four-gate spillways',        'Controlled release sized to the catchment above it.',            'LYzR1fjNIy8'],
  ['Francis runners',            'The reaction turbine that suits high head and low flow.',        'dltY3vu2qSw'],
  ['Screw turbines',             'An Archimedes screw run in reverse to take power out.',          'HUnUNIjSFlA'],
  ['Overshot waterwheels',       'The oldest answer to the problem, still worth filming.',         'wcRYeBANUwI'],
  ['Salvaged-part machinery',    'A hydroelectric wheel built from a broken bicycle rim.',         'fLEPrSs0gmM'],
  ['Twin-unit installations',    'Two generators sharing one head, synchronised on the board.',    '8NxHVGrFWEk'],
  ['Mid-lake powerhouses',       'The machine hall set out in open water rather than on the bank.','R1H5asDhP4k'],
  ['220V generation',            'Mains voltage produced and measured at miniature scale.',        'jNCivw94vBo'],
  ['Off-grid supply',            'Enough output to take a household off the bill entirely.',       'JFkxrcVw0uU'],
  ['Irrigation & storage',       'A reservoir sized to water crops and hold fish through the dry.','33seQN27dSI'],
  ['Mixed rail & road bridges',  'Two rail lanes and two road lanes carried on one deck.',         'aEK6Lpb8fN8'],
  ['Swing bridges',              'A span that opens — the mechanism is the point.',                '_US6ELD0BXc'],
  ['Machine-cut roadworks',      'Excavators, dozers and rollers building access to the site.',    'k1_dsa8yzEE']
];

/* The journey. */
export const TIMELINE = [
  { year: '2011', title: 'The channel opens',
    body: 'Mini Construction is registered on 11 October 2011 — a channel about building real infrastructure in miniature, filmed on real water in the hills of Vietnam.' },
  { year: 'Water', title: 'The stream becomes the studio',
    body: 'Dams go in on live watercourses rather than in a tray. Diversion, excavation and foundation are filmed as a sequence, because on a river the sequence is the engineering.' },
  { year: 'Power', title: 'The lights come on',
    body: 'Generation arrives. Small units first, then units that genuinely matter: 120 volts, then 220, measured on a meter at the end of every build.' },
  { year: 'Turbines', title: 'Twenty-three answers to one question',
    body: 'Francis runners, screw turbines, suction wheels, overshot wheels. The channel stops building one machine and starts comparing them.' },
  { year: 'Record', title: 'Fifteen million for a curved dam',
    body: 'A curved hydroelectric dam with a Francis turbine becomes the most-watched build on the channel — nineteen and a half minutes, no commentary, every stage kept in.' },
  { year: 'Scale', title: 'Past the hour mark',
    body: 'Complete projects run to an hour and beyond. Bridges, roads and houses join the waterworks, and a scale model of London takes a month.' },
  { year: '2026', title: 'Seventy million and still flowing',
    body: 'One hundred and seventy filmed projects, forty-five hours of footage, and an audience that came to watch water turned into electricity by hand.' }
];

export const PLATFORMS = [
  { k: 'youtube', name: 'YouTube', handle: '@Chien-Tran', stat: '297K', statLabel: 'subscribers',
    extra: '70.3M views · 178 uploads · since October 2011', url: BRAND.links.youtube }
];

/* The three builds that play on loop in the "In motion" band. */
export const MOTION = ['ILMIUPRLi0M', 'jNCivw94vBo', 'wxEv3snzc-Y'];

/* The four stills in the craft column. */
export const STACK = ['gRwtMFAvZf0', 'AcWAaoiRWHo', 'HUnUNIjSFlA', 'up3DVaqjeG8'];

export const FILTERS = [
  { k: 'all',     label: 'All work' },
  { k: 'hydro',   label: 'Hydroelectric Plants' },
  { k: 'dam',     label: 'Dams & Water Control' },
  { k: 'house',   label: 'Houses' },
  { k: 'turbine', label: 'Turbines' },
  { k: 'bridge',  label: 'Bridges' },
  { k: 'works',   label: 'Earthworks' }
];
