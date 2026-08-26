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

/* Westeros: wide in the north, pinched hard at the Neck around y≈375, then
   broadening again through the Reach and out into Dorne in the south-east. */
/* The steps are deliberately uneven — a few deep bays and long capes rather
   than a regular zigzag, which would read as a sawtooth instead of a coast. */
const WESTEROS_PATH = `M 138 54
  L 182 40 L 228 52 L 268 36 L 312 48 L 358 34 L 402 46 L 448 60
  L 468 92 L 452 124 L 474 150 L 458 182 L 486 206 L 462 238
  L 492 266 L 470 296 L 492 322 L 452 342 L 400 354 L 352 366
  L 334 384 L 376 400 L 428 412 L 458 436 L 492 466 L 472 494
  L 500 522 L 472 550 L 494 578 L 518 612 L 490 646 L 510 684
  L 486 722 L 514 758 L 480 796 L 436 830 L 382 850 L 322 846
  L 266 856 L 210 826 L 180 790 L 192 756 L 168 722 L 196 690
  L 172 664 L 188 636 L 150 612 L 178 584 L 156 558 L 172 530
  L 140 506 L 152 478 L 170 452 L 140 430 L 166 404 L 214 392
  L 262 376 L 232 362 L 170 348 L 128 326 L 150 300 L 158 272
  L 140 252 L 126 218 L 152 188 L 138 146 L 146 108 L 130 80 Z`;

/* Essos: only the western coast is on this map — the rest runs off the edge. */
const ESSOS_PATH = `M 612 40
  L 668 28 L 704 58 L 678 98 L 720 124 L 692 160 L 742 190
  L 704 226 L 760 252 L 728 296 L 778 322 L 746 360 L 794 392
  L 758 428 L 814 454 L 782 496 L 838 520 L 798 562 L 858 588
  L 822 632 L 880 656 L 844 700 L 902 726 L 868 770 L 920 798
  L 936 798 L 936 28 Z`;

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
        <stop offset="0%"  stop-color="#22201c"/>
        <stop offset="55%" stop-color="#191712"/>
        <stop offset="100%" stop-color="#14120f"/>
      </linearGradient>
      <linearGradient id="seaGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stop-color="#080a0e"/>
        <stop offset="100%" stop-color="#05070a"/>
      </linearGradient>
      <filter id="mapGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="7"/>
        <feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <pattern id="waves" width="46" height="26" patternUnits="userSpaceOnUse">
        <path d="M0 18 q 11 -9 23 0 t 23 0" fill="none"
              stroke="rgba(140,175,205,0.10)" stroke-width="1.1"/>
      </pattern>
    </defs>

    <rect x="90" y="20" width="850" height="860" fill="url(#seaGrad)"/>
    <rect x="90" y="20" width="850" height="860" fill="url(#waves)"/>

    <g filter="url(#rough)">
      <path d="${WESTEROS_PATH}" class="landmass"/>
      <path d="${ESSOS_PATH}" class="landmass"/>
    </g>

    <!-- the Wall -->
    <g class="the-wall">
      <line x1="140" y1="140" x2="462" y2="140"/>
      <line x1="140" y1="134" x2="462" y2="134" class="wall-cap"/>
    </g>
    <text x="150" y="122" class="map-label wall-label">THE WALL · 300 MILES · 700 FEET</text>
    <text x="196" y="70" class="map-label region-label">THE LANDS OF ALWAYS WINTER</text>
    <text x="230" y="300" class="map-label region-label">THE NORTH</text>
    <text x="238" y="486" class="map-label region-label">THE RIVERLANDS</text>
    <text x="330" y="700" class="map-label region-label">THE REACH</text>
    <text x="392" y="812" class="map-label region-label">DORNE</text>
    <text x="560" y="420" class="map-label sea-label">THE NARROW SEA</text>
    <text x="700" y="640" class="map-label sea-label">THE SMOKING SEA</text>
    <text x="770" y="120" class="map-label region-label">ESSOS</text>

    <!-- raven flight path, animated -->
    <path id="ravenPath" d="M 300 262 C 420 300 520 380 660 300 C 760 250 820 340 862 548"
          fill="none" stroke="rgba(201,162,39,0.20)" stroke-width="1.2"
          stroke-dasharray="5 7"/>
    <g class="raven">
      <path d="M -7 0 q 4 -5 8 0 q 4 -5 8 0 q -4 4 -8 1 q -4 3 -8 -1 Z"/>
      <animateMotion dur="26s" repeatCount="indefinite" rotate="auto">
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

  host.appendChild(svg);
  return svg;
}
