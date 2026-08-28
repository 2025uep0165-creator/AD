/* ==========================================================================
   map.js — a hand-plotted, stylised map of Westeros and the west of Essos.
   Drawn as SVG (so it stays crisp at any zoom), with selectable locations,
   a drifting raven, and the Wall running across the top of the continent.
   ========================================================================== */

const LOCATIONS = [
  /* --- Westeros ------------------------------------------------------- */
  { id: 'hardhome', name: 'Hardhome', x: 372, y: 78, region: 'Beyond the Wall', house: 'watch',
    text: 'A Free Folk settlement on the Shivering Sea. Jon Snow came to save its people and watched the Night King raise every one he could not.',
    tag: 'The dead walk here' },
  { id: 'castleblack', name: 'Castle Black', x: 286, y: 150, region: 'The Wall', house: 'watch',
    text: 'Headquarters of the Night\'s Watch. Seven hundred feet of ice, three hundred miles long, and about a hundred men left to hold it.',
    tag: '"And now my watch begins"' },
  { id: 'bearisland', name: 'Bear Island', x: 138, y: 236, region: 'The North', house: 'mormont',
    text: 'Cold, poor, and stubborn. It sent sixty-two men to the war — and one ten-year-old girl who shamed a room full of lords into fighting.',
    tag: 'House Mormont · Here We Stand' },
  { id: 'winterfell', name: 'Winterfell', x: 296, y: 262, region: 'The North', house: 'stark',
    text: 'Seat of House Stark for eight thousand years, built over hot springs so the walls are warm in the deepest winter. Sacked, burned, retaken, and finally the place where the Long Night ended.',
    tag: 'House Stark · Winter Is Coming' },
  { id: 'dreadfort', name: 'The Dreadfort', x: 388, y: 240, region: 'The North', house: 'bolton',
    text: 'Seat of House Bolton, who flay their enemies and hang the skins on the walls. Where Theon Greyjoy was taken apart and Reek was assembled.',
    tag: 'House Bolton · Our Blades Are Sharp' },
  { id: 'whiteharbor', name: 'White Harbor', x: 414, y: 312, region: 'The North', house: 'stark',
    text: 'The North\'s only true city and its one warm-water port. House Manderly holds it, and their loyalty to the Starks outlasted almost everyone else\'s.',
    tag: 'The North\'s gateway' },
  { id: 'twins', name: 'The Twins', x: 264, y: 404, region: 'The Riverlands', house: 'tully',
    text: 'Two castles and a bridge over the Green Fork — the only crossing for hundreds of miles, which is the entire source of House Frey\'s power. And the site of the Red Wedding.',
    tag: 'Guest right, broken' },
  { id: 'moatcailin', name: 'Moat Cailin', x: 304, y: 372, region: 'The Neck', house: 'stark',
    text: 'A ruined causeway fortress in the swamps. Whoever holds it holds the only road into the North — which is why the North has never been taken from the south.',
    tag: 'The gate to the North' },
  { id: 'riverrun', name: 'Riverrun', x: 278, y: 452, region: 'The Riverlands', house: 'tully',
    text: 'Seat of House Tully, set in the fork of two rivers so the moat can be flooded on command. Catelyn Stark grew up here.',
    tag: 'House Tully · Family, Duty, Honor' },
  { id: 'pyke', name: 'Pyke', x: 116, y: 440, region: 'The Iron Islands', house: 'greyjoy',
    text: 'A castle on sea stacks, joined by rope bridges, hammered by the surf. The ironborn take what is theirs from here and pay the iron price for it.',
    tag: 'House Greyjoy · We Do Not Sow' },
  { id: 'eyrie', name: 'The Eyrie', x: 396, y: 434, region: 'The Vale', house: 'arryn',
    text: 'A castle in the sky, reached by mule up a mountain path that kills more men than any siege. Its sky cells have three walls; the fourth is the drop.',
    tag: 'House Arryn · As High as Honor' },
  { id: 'harrenhal', name: 'Harrenhal', x: 336, y: 464, region: 'The Riverlands', house: 'tully',
    text: 'The largest castle in Westeros, and the most cursed. Harren the Black finished it the day Aegon arrived with Balerion and cooked him inside his own towers.',
    tag: 'Melted from the inside' },
  { id: 'casterly', name: 'Casterly Rock', x: 192, y: 506, region: 'The Westerlands', house: 'lannister',
    text: 'A mountain hollowed into a fortress over a gold mine that has not run dry in three thousand years. Tyrion once ran its sewers, and did it well.',
    tag: 'House Lannister · Hear Me Roar' },
  { id: 'kingslanding', name: "King's Landing", x: 424, y: 548, region: 'The Crownlands', house: 'lannister',
    text: 'Half a million people, the Red Keep, the Great Sept, Flea Bottom, and the Iron Throne itself. Built where Aegon first landed. Burned to the ground by the last Targaryen.',
    tag: 'The Iron Throne' },
  { id: 'dragonstone', name: 'Dragonstone', x: 522, y: 516, region: 'The Narrow Sea', house: 'targaryen',
    text: 'A Valyrian fortress of black stone and carved dragons on a volcanic island. The Targaryen foothold for a century before the Conquest — and where Daenerys came home.',
    tag: 'House Targaryen · Fire and Blood' },
  { id: 'stormsend', name: "Storm's End", x: 450, y: 642, region: 'The Stormlands', house: 'baratheon',
    text: 'Built by Bran the Builder, unbroken by any storm in living memory. Its walls are so thick and so seamless that no army has ever taken it by force — only by shadow.',
    tag: 'House Baratheon · Ours Is the Fury' },
  { id: 'highgarden', name: 'Highgarden', x: 268, y: 640, region: 'The Reach', house: 'tyrell',
    text: 'Terraced gardens, briar labyrinths, and the richest farmland in the Seven Kingdoms. The Reach feeds Westeros — which made it the first thing Cersei took.',
    tag: 'House Tyrell · Growing Strong' },
  { id: 'oldtown', name: 'Oldtown', x: 214, y: 724, region: 'The Reach', house: 'tyrell',
    text: 'The oldest city in Westeros. Home of the Citadel, where maesters forge their chains, and of the Hightower whose beacon burns day and night.',
    tag: 'Where the maesters are made' },
  { id: 'sunspear', name: 'Sunspear', x: 448, y: 792, region: 'Dorne', house: 'martell',
    text: 'Seat of House Martell in the only kingdom the dragons never conquered. Dorne joined the realm by marriage and has never once let anybody forget it.',
    tag: 'Unbowed, Unbent, Unbroken' },

  /* --- Essos ---------------------------------------------------------- */
  { id: 'braavos', name: 'Braavos', x: 664, y: 150, region: 'The Free Cities', house: 'watch',
    text: 'A city of canals under the legs of the Titan, founded by escaped slaves. Home of the Iron Bank — and the House of Black and White, where Arya learned to be no one.',
    tag: 'Valar morghulis' },
  { id: 'pentos', name: 'Pentos', x: 744, y: 300, region: 'The Free Cities', house: 'targaryen',
    text: 'Where Illyrio Mopatis kept two exiled Targaryen children, and where Viserys sold his sister to a Dothraki khal for an army he never got.',
    tag: 'Where the exile began' },
  { id: 'vaes', name: 'Vaes Dothrak', x: 872, y: 236, region: 'The Dothraki Sea', house: 'greyjoy',
    text: 'The only city of the Dothraki, where no blade may be drawn. Viserys got his golden crown here. Daenerys burned the temple down and walked out of the fire again.',
    tag: 'The city with no walls' },
  { id: 'volantis', name: 'Volantis', x: 804, y: 488, region: 'The Free Cities', house: 'martell',
    text: 'The oldest and proudest daughter of Valyria, split by the Rhoyne, ruled by triarchs and run on slaves. Five slaves for every free man.',
    tag: 'First daughter of Valyria' },
  { id: 'valyria', name: 'Valyria', x: 850, y: 606, region: 'The Smoking Sea', house: 'targaryen',
    text: 'A peninsula of dragonlords, glass roads and sorcery, ended in a single day by the Doom. What is left smokes, and nobody who sails in comes back sane.',
    tag: 'The Doom took everything' },
  { id: 'meereen', name: 'Meereen', x: 862, y: 548, region: 'Slaver\'s Bay', house: 'targaryen',
    text: 'The great pyramid, the fighting pits, and the harpy on the gate. Daenerys took three slaver cities and then had to learn the far harder trick of holding one.',
    tag: 'Mhysa' },
  { id: 'qarth', name: 'Qarth', x: 884, y: 704, region: 'The Jade Sea', house: 'martell',
    text: 'The greatest city that ever was or will be — or so the Qartheen say. Warlocks, spice kings, and the House of the Undying, which Drogon burned.',
    tag: 'The Undying burned' }
];

/* The coastlines are drawn as cubic curves rather than line segments: a coast
   is made of long sweeps and a few deep bays, and a chain of straight steps
   reads as a sawtooth no matter how the amplitudes are varied. The SVG
   displacement filter below roughens them again at the pixel level, which is
   where the fractal detail belongs.

   Westeros, clockwise from the north-west: the wide North, the Bite biting in
   above the Neck, the Vale bulging back out, Blackwater Bay, the Stormlands,
   and Dorne running away to the south-east. */
const WESTEROS_PATH = `M 152 66
  C 198 44, 258 54, 302 46   C 352 38, 406 58, 452 76
  C 472 112, 458 142, 468 178   C 480 212, 462 240, 470 270
  C 476 300, 440 306, 424 332   C 400 358, 352 366, 336 390
  C 330 412, 380 414, 420 428   C 470 442, 500 452, 494 480
  C 488 508, 442 518, 438 542   C 436 566, 466 578, 476 600
  C 486 626, 472 652, 478 680   C 500 714, 530 744, 514 784
  C 500 814, 456 834, 412 836   C 356 846, 302 830, 254 812
  C 216 800, 184 778, 176 748   C 168 716, 190 688, 184 660
  C 178 632, 156 606, 164 578   C 172 548, 150 524, 158 498
  C 164 468, 142 444, 150 418   C 156 402, 200 394, 244 382
  C 250 362, 206 344, 172 322   C 146 296, 162 262, 150 232
  C 140 200, 158 160, 146 122   C 138 96, 144 76, 152 66 Z`;

/* Essos: only the western seaboard is on this map — Braavos and the lagoon,
   the Pentoshi coast, the long run south to Volantis, and the drowned
   Valyrian peninsula. Everything east of that runs off the edge. */
const ESSOS_PATH = `M 596 38
  C 636 24, 664 44, 652 76   C 640 108, 616 128, 630 158
  C 646 190, 690 200, 706 230   C 722 258, 700 286, 716 316
  C 732 348, 776 358, 786 392   C 796 426, 764 452, 776 486
  C 788 520, 830 528, 836 560   C 842 592, 812 604, 820 636
  C 828 668, 866 682, 862 716   C 858 752, 878 786, 890 824
  L 944 824 L 944 24 Z`;

/* The islands that matter, each one a place on the map above. */
const ISLES = [
  /* Bear Island */
  `M 120 218 C 140 210, 156 220, 152 236 C 148 252, 126 258, 114 246
   C 104 236, 108 222, 120 218 Z`,
  /* the Iron Islands — Pyke and its neighbours, a broken little archipelago */
  `M 98 424 C 116 414, 134 424, 130 442 C 126 460, 104 466, 92 454
   C 82 444, 86 430, 98 424 Z`,
  `M 136 402 C 148 396, 158 404, 154 414 C 149 424, 135 426, 130 416 Z`,
  `M 138 466 C 150 460, 160 468, 155 478 C 150 488, 136 489, 132 479 Z`,
  /* Dragonstone */
  `M 508 500 C 528 492, 546 504, 542 522 C 538 540, 514 546, 502 532
   C 492 521, 496 505, 508 500 Z`,
  /* Skagos, off the north-east shoulder */
  `M 494 250 C 512 244, 526 254, 521 268 C 516 282, 496 285, 488 273
   C 482 264, 485 253, 494 250 Z`,
  /* Tarth and the Sapphire Isle chain in the narrow sea */
  `M 500 616 C 514 610, 524 620, 519 632 C 514 644, 498 645, 493 634 Z`
];

function buildMap(host) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '90 20 850 860');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Map of Westeros and western Essos');

  svg.innerHTML = `
    <defs>
      <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2a2318"/>
        <stop offset="42%"  stop-color="#221d15"/>
        <stop offset="100%" stop-color="#191510"/>
      </linearGradient>
      <radialGradient id="seaGrad" cx="50%" cy="45%" r="75%">
        <stop offset="0%"   stop-color="#0b1420"/>
        <stop offset="70%"  stop-color="#070d16"/>
        <stop offset="100%" stop-color="#04070c"/>
      </radialGradient>
      <filter id="mapGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="4" seed="11"/>
        <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <!-- aged vellum: fibre noise burnt in over the land -->
      <filter id="vellum" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3" result="n"/>
        <feColorMatrix in="n" type="saturate" values="0"/>
        <feComponentTransfer><feFuncA type="linear" slope=".26"/></feComponentTransfer>
      </filter>
      <pattern id="waves" width="52" height="30" patternUnits="userSpaceOnUse">
        <path d="M0 20 q 13 -10 26 0 t 26 0" fill="none"
              stroke="rgba(150,185,215,0.085)" stroke-width="1"/>
      </pattern>
      <!-- relief hatching for the mountain belts -->
      <pattern id="ridges" width="14" height="10" patternUnits="userSpaceOnUse">
        <path d="M1 9 L7 2 L13 9" fill="none" stroke="rgba(226,208,170,.30)" stroke-width="1.2"/>
      </pattern>
      <pattern id="woods" width="16" height="14" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="2.6" fill="none" stroke="rgba(150,180,140,.24)" stroke-width="1"/>
      </pattern>
      <clipPath id="clipWest"><path d="${WESTEROS_PATH}"/></clipPath>
      <clipPath id="clipEast"><path d="${ESSOS_PATH}"/></clipPath>
    </defs>

    <rect x="60" y="0" width="920" height="920" fill="url(#seaGrad)"/>
    <rect x="60" y="0" width="920" height="920" fill="url(#waves)"/>

    <g filter="url(#rough)">
      <path d="${WESTEROS_PATH}" class="landmass"/>
      <path d="${ESSOS_PATH}" class="landmass"/>
      ${ISLES.map(d => `<path d="${d}" class="landmass isle"/>`).join('')}
    </g>

    <!-- terrain, clipped to the coastlines -->
    <g clip-path="url(#clipWest)">
      <rect x="60" y="0" width="920" height="920" filter="url(#vellum)" opacity=".5"/>
      <!-- relief laid down as soft masses, so no rectangle edges show -->
      <ellipse cx="212" cy="300" rx="52" ry="118" fill="url(#ridges)" opacity=".5"/>
      <ellipse cx="238" cy="470" rx="46" ry="96"  fill="url(#ridges)" opacity=".42"/>
      <ellipse cx="392" cy="440" rx="58" ry="74"  fill="url(#ridges)" opacity=".5"/>
      <ellipse cx="384" cy="250" rx="66" ry="88"  fill="url(#woods)"  opacity=".46"/>
      <ellipse cx="300" cy="640" rx="104" ry="72" fill="url(#woods)"  opacity=".4"/>
      <ellipse cx="436" cy="770" rx="72" ry="56"  fill="url(#ridges)" opacity=".32"/>
    </g>
    <g clip-path="url(#clipEast)">
      <rect x="600" y="0" width="380" height="920" filter="url(#vellum)" opacity=".5"/>
      <ellipse cx="852" cy="272" rx="84" ry="112" fill="url(#ridges)" opacity=".38"/>
      <ellipse cx="800" cy="620" rx="76" ry="64"  fill="url(#ridges)" opacity=".3"/>
    </g>

    <!-- compass rose, out in the Summer Sea where there is room for it -->
    <g class="compass" transform="translate(596 762)">
      <circle r="40" class="c-ring"/>
      <circle r="27" class="c-ring"/>
      <path d="M 0 -38 L 7 -7 L 38 0 L 7 7 L 0 38 L -7 7 L -38 0 L -7 -7 Z" class="c-star"/>
      <path d="M 0 -26 L 4 -4 L 26 0 L 4 4 L 0 26 L -4 4 L -26 0 L -4 -4 Z" class="c-star c-in"/>
      <text y="-46" class="map-label c-n">N</text>
    </g>

    <!-- the Wall -->
    <g class="the-wall" clip-path="url(#clipWest)">
      <line x1="120" y1="140" x2="486" y2="140"/>
      <line x1="120" y1="134" x2="486" y2="134" class="wall-cap"/>
    </g>
    <text x="168" y="122" class="map-label wall-label">THE WALL · 300 MILES · 700 FEET</text>
    <text x="196" y="70"  class="map-label region-label">THE LANDS OF ALWAYS WINTER</text>
    <text x="230" y="300" class="map-label region-label">THE NORTH</text>
    <text x="238" y="486" class="map-label region-label">THE RIVERLANDS</text>
    <text x="330" y="700" class="map-label region-label">THE REACH</text>
    <text x="404" y="806" class="map-label region-label">DORNE</text>
    <text x="560" y="420" class="map-label sea-label">THE NARROW SEA</text>
    <text x="700" y="640" class="map-label sea-label">THE SMOKING SEA</text>
    <text x="800" y="120" class="map-label region-label">ESSOS</text>

    <path id="ravenPath" d="M 300 262 C 420 300 520 380 660 300 C 760 250 820 340 862 548"
          fill="none" stroke="rgba(201,162,39,0.16)" stroke-width="1.1"
          stroke-dasharray="4 8"/>
    <g class="raven">
      <path d="M -7 0 q 4 -5 8 0 q 4 -5 8 0 q -4 4 -8 1 q -4 3 -8 -1 Z"/>
      <animateMotion dur="30s" repeatCount="indefinite" rotate="auto">
        <mpath href="#ravenPath"/>
      </animateMotion>
    </g>

    <g class="pins"></g>
  `;

  const pins = svg.querySelector('.pins');
  LOCATIONS.forEach((loc, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pin');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', loc.name);
    g.dataset.id = loc.id;
    g.style.setProperty('--i', i);
    /* labels on the far right would run off the map, so flip them inward */
    const flip = loc.x > 640;
    g.innerHTML = `
      <circle cx="${loc.x}" cy="${loc.y}" r="17" class="pin-hit"/>
      <circle cx="${loc.x}" cy="${loc.y}" r="9" class="pin-halo"/>
      <circle cx="${loc.x}" cy="${loc.y}" r="3.4" class="pin-dot"/>
      <text x="${loc.x + (flip ? -12 : 12)}" y="${loc.y + 4}" class="pin-name"
            text-anchor="${flip ? 'end' : 'start'}">${loc.name}</text>
    `;
    pins.appendChild(g);
  });

  /* everything except the sea sits in one group so pan/zoom is a transform */
  const NSV = 'http://www.w3.org/2000/svg';
  const scene = document.createElementNS(NSV, 'g');
  scene.setAttribute('class', 'map-scene');
  while (svg.children.length > 1) {                 /* keep <defs> at the top */
    const n = svg.children[1];
    if (n.tagName === 'defs') break;
    scene.appendChild(n);
  }
  svg.appendChild(scene);

  host.appendChild(svg);
  return svg;
}
