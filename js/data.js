/* ==========================================================================
   data.js — The lore. Everything the site renders comes from here.
   Sigils are hand-authored SVG (100x100 viewBox), so the whole site is
   self-contained: no external images, no CDN, no tracking.
   ========================================================================== */

const SIGILS = {
  /* Direwolf head — House Stark. Angular: tall ears, narrow muzzle, ruff. */
  stark: `<path d="M22 12 L33 40 L50 33 L67 40 L78 12 L83 44 L90 62 L74 66
      L69 83 L50 97 L31 83 L26 66 L10 62 L17 44 Z"/>
    <path d="M40 60 L50 55 L60 60 L57 79 L50 87 L43 79 Z" class="face"/>
    <circle cx="37" cy="52" r="4.2" class="eye"/><circle cx="63" cy="52" r="4.2" class="eye"/>
    <path d="M44 63 L56 63 L50 72 Z" class="snout"/>
    <path d="M50 72 L50 80" class="dk"/>`,

  /* Lion head — House Lannister. The mane is a twelve-point star. */
  lannister: `<path d="M50 4 L58.8 17.2 L73 10.2 L74 26 L89.8 27 L82.8 41.2 L96 50
      L82.8 58.8 L89.8 73 L74 74 L73 89.8 L58.8 82.8 L50 96 L41.2 82.8 L27 89.8
      L26 74 L10.2 73 L17.2 58.8 L4 50 L17.2 41.2 L10.2 27 L26 26 L27 10.2 L41.2 17.2 Z"/>
    <path d="M50 22 C65 22 78 33 78 48 C78 65 65 79 50 79 C35 79 22 65 22 48
      C22 33 35 22 50 22 Z" class="face"/>
    <path d="M36 55 Q50 48 64 55 Q64 72 50 77 Q36 72 36 55 Z" class="soft"/>
    <circle cx="40" cy="46" r="3.6" class="eye"/><circle cx="60" cy="46" r="3.6" class="eye"/>
    <path d="M44 56 L56 56 L50 64 Z" class="snout"/>
    <path d="M50 64 L50 70 M50 70 Q44 74 39 69 M50 70 Q56 74 61 69" class="dk"/>`,

  /* Three-headed dragon — House Targaryen. Wings behind, three necks, one
     body. The heads carry the read, so they are drawn large. */
  targaryen: `<path d="M42 66 C28 58 14 60 4 74 C16 76 24 82 29 92 C33 80 37 71 43 66 Z"/>
    <path d="M58 66 C72 58 86 60 96 74 C84 76 76 82 71 92 C67 80 63 71 57 66 Z"/>
    <path d="M50 99 C45 90 43 80 43 72 C43 65 46 61 50 61 C54 61 57 65 57 72
      C57 80 55 90 50 99 Z"/>
    <path d="M46 66 C36 62 27 55 21 45 M54 66 C64 62 73 55 79 45 M50 61 L50 42" class="tent"/>
    <g transform="translate(18,40) rotate(-42) scale(1.35)">
      <path d="M-6 13 L-9 2 L-5 -9 L3 -14 L12 -13 L15 -8 L7 -5 L14 -1 L13 4 L3 6 L1 13 Z"/>
      <path d="M3 -14 L0 -25 L9 -16 Z"/>
      <circle cx="2" cy="-5" r="2.2" class="eye"/>
    </g>
    <g transform="translate(82,40) rotate(42) scale(-1.35,1.35)">
      <path d="M-6 13 L-9 2 L-5 -9 L3 -14 L12 -13 L15 -8 L7 -5 L14 -1 L13 4 L3 6 L1 13 Z"/>
      <path d="M3 -14 L0 -25 L9 -16 Z"/>
      <circle cx="2" cy="-5" r="2.2" class="eye"/>
    </g>
    <g transform="translate(50,29) scale(1.35)">
      <path d="M-6 13 L-9 2 L-5 -9 L3 -14 L12 -13 L15 -8 L7 -5 L14 -1 L13 4 L3 6 L1 13 Z"/>
      <path d="M3 -14 L0 -25 L9 -16 Z"/>
      <circle cx="2" cy="-5" r="2.2" class="eye"/>
    </g>`,

  /* Crowned stag — House Baratheon */
  baratheon: `<path d="M50 34 C60 34 68 44 68 58 C68 74 60 88 50 94 C40 88 32 74 32 58
      C32 44 40 34 50 34 Z"/>
    <path d="M38 36 C30 28 26 18 26 8 C32 14 36 12 40 6 C42 16 42 26 44 32 Z"/>
    <path d="M62 36 C70 28 74 18 74 8 C68 14 64 12 60 6 C58 16 58 26 56 32 Z"/>
    <path d="M30 24 L18 18 M70 24 L82 18 M34 14 L24 6 M66 14 L76 6" class="ln"/>
    <circle cx="43" cy="54" r="3.2" class="eye"/><circle cx="57" cy="54" r="3.2" class="eye"/>
    <path d="M45 70 L50 66 L55 70 L50 78 Z" class="snout"/>`,

  /* Kraken — House Greyjoy */
  greyjoy: `<path d="M50 8 C62 8 70 18 70 32 C70 42 66 50 60 56 L40 56 C34 50 30 42 30 32
      C30 18 38 8 50 8 Z"/>
    <circle cx="42" cy="30" r="3.5" class="eye"/><circle cx="58" cy="30" r="3.5" class="eye"/>
    <path d="M42 56 C38 68 30 76 18 80 C24 84 32 82 38 76 C36 84 30 90 22 94" class="tent"/>
    <path d="M46 56 C44 70 40 82 34 92" class="tent"/>
    <path d="M50 56 C50 70 50 82 50 96" class="tent"/>
    <path d="M54 56 C56 70 60 82 66 92" class="tent"/>
    <path d="M58 56 C62 68 70 76 82 80 C76 84 68 82 62 76 C64 84 70 90 78 94" class="tent"/>`,

  /* Rose — House Tyrell. Five petals, a seeded centre, a stem below. */
  tyrell: `<circle cx="50" cy="27" r="19"/><circle cx="72" cy="43" r="19"/>
    <circle cx="63" cy="70" r="19"/><circle cx="37" cy="70" r="19"/>
    <circle cx="28" cy="43" r="19"/>
    <path d="M50 50 L50 10 M50 50 L88 36 M50 50 L73 86 M50 50 L27 86 M50 50 L12 36" class="dk"/>
    <circle cx="50" cy="50" r="17" class="face"/>
    <circle cx="50" cy="50" r="7" class="soft"/>`,

  /* Sun pierced by a spear — House Martell */
  martell: `<circle cx="50" cy="50" r="24"/>
    <path d="M50 12 L54 24 L46 24 Z M50 88 L46 76 L54 76 Z M12 50 L24 46 L24 54 Z
      M88 50 L76 54 L76 46 Z M23 23 L34 28 L28 34 Z M77 77 L66 72 L72 66 Z
      M77 23 L72 34 L66 28 Z M23 77 L28 66 L34 72 Z" class="rays"/>
    <path d="M14 86 L80 20" class="spear"/>
    <path d="M80 20 L92 8 L86 24 L72 30 Z" class="tip"/>`,

  /* Falcon and crescent moon — House Arryn. Moon behind, wings spread. */
  arryn: `<path d="M50 1 A11 11 0 0 0 50 23 A15 15 0 0 1 50 1 Z" class="soft"/>
    <path d="M50 28 C55 28 59 32 59 37 L68 43 L90 32 L94 39 L75 56 L82 78 L73 80
      L60 62 L57 85 L63 94 L50 91 L37 94 L43 85 L40 62 L27 80 L18 78 L25 56
      L6 39 L10 32 L32 43 L41 37 C41 32 45 28 50 28 Z"/>
    <circle cx="50" cy="35" r="2.8" class="eye"/>
    <path d="M50 40 L54 47 L46 47 Z" class="snout"/>`,

  /* Leaping trout — House Tully */
  tully: `<path d="M14 50 C26 30 44 20 62 20 C76 20 86 28 90 40 C92 48 90 56 86 62
      C78 76 60 84 44 84 C30 84 18 74 14 60 Z"/>
    <path d="M14 56 L2 40 L4 62 L2 84 L16 66 Z" class="fin"/>
    <path d="M46 20 L54 6 L62 22" class="fin"/>
    <path d="M46 84 L52 96 L60 82" class="fin"/>
    <circle cx="74" cy="42" r="4" class="eye"/>
    <path d="M62 30 C66 44 66 58 60 72" class="ln"/>`,

  /* Flayed man — House Bolton */
  bolton: `<path d="M50 10 C57 10 62 16 62 24 C62 30 59 35 55 38 L58 46
      C66 48 72 56 72 66 L70 88 L60 88 L58 66 L56 92 L44 92 L42 66 L40 88 L30 88
      L28 66 C28 56 34 48 42 46 L45 38 C41 35 38 30 38 24 C38 16 43 10 50 10 Z"/>
    <path d="M20 30 L40 44 M80 30 L60 44" class="ln"/>`,

  /* Crossed swords / the Watch */
  watch: `<path d="M18 84 L74 20 L82 12 L80 26 L26 90 Z"/>
    <path d="M82 84 L26 20 L18 12 L20 26 L74 90 Z"/>
    <circle cx="50" cy="52" r="6" class="eye"/>`,

  /* Bear — House Mormont */
  mormont: `<path d="M28 22 C28 14 34 8 42 8 C46 8 50 10 52 13 C54 10 58 8 62 8
      C70 8 76 14 76 22 C76 26 74 30 71 32 C78 40 82 52 82 62 C82 80 68 92 50 92
      C32 92 18 80 18 62 C18 52 22 40 29 32 C26 30 28 26 28 22 Z"/>
    <circle cx="40" cy="52" r="3.6" class="eye"/><circle cx="60" cy="52" r="3.6" class="eye"/>
    <path d="M42 68 L50 63 L58 68 L50 77 Z" class="snout"/>`
};

/* -------------------------------------------------------------------------- */

const HOUSES = [
  {
    key: 'stark', banners: ['Bolton', 'Karstark', 'Umber', 'Mormont', 'Manderly', 'Reed', 'Glover', 'Hornwood'], name: 'Stark', words: 'Winter Is Coming', seat: 'Winterfell',
    region: 'The North', beast: 'Direwolf',
    c1: '#cfd8dc', c2: '#5b6b74', accent: '#e8f1f5',
    heads: ['Eddard "Ned" Stark', 'Robb Stark, the Young Wolf', 'Sansa, Queen in the North'],
    blurb: 'Blood of the First Men, kings of winter for eight thousand years. They keep the old gods, they keep their word, and they pay the iron price for both. Every Stark who leaves the North for the south comes back changed — or does not come back at all.',
    fact: 'Six direwolf pups for six Stark children, found beside a dead mother in the snow. An omen nobody read closely enough.'
  },
  {
    key: 'lannister', banners: ['Clegane', 'Payne', 'Marbrand', 'Crakehall', 'Lefford', 'Westerling', 'Swyft'], name: 'Lannister', words: 'Hear Me Roar!', seat: 'Casterly Rock',
    region: 'The Westerlands', beast: 'Lion',
    c1: '#e0b23c', c2: '#8e1220', accent: '#ffd76a',
    heads: ['Tywin Lannister', 'Cersei, First of Her Name', 'Tyrion, Hand of the King'],
    blurb: 'Gold beneath the Rock and gold in the hair. The Lannisters buy what they cannot take and burn what they cannot buy. Their unofficial motto is the one everyone actually remembers — and it is always a threat as much as a promise.',
    fact: '"A Lannister always pays his debts" is not the house words at all. It is a family saying — and it cuts both ways.'
  },
  {
    key: 'targaryen', banners: ['Velaryon', 'Celtigar', 'Massey', 'Sunglass', 'Bar Emmon'], name: 'Targaryen', words: 'Fire and Blood', seat: 'Dragonstone',
    region: 'The Crownlands', beast: 'Three-Headed Dragon',
    c1: '#d8262f', c2: '#1a1a1e', accent: '#ff6b4a',
    heads: ['Aegon the Conqueror', 'Aerys II, the Mad King', 'Daenerys Stormborn'],
    blurb: 'The last of Old Valyria. They wed brother to sister to keep the blood pure, and every time a Targaryen is born the gods flip a coin between greatness and madness. Aegon took six kingdoms with three dragons. Three hundred years later there were no dragons — until there were.',
    fact: 'Drogon, Rhaegal and Viserion — named for a dead husband and two dead brothers. Grief given wings.'
  },
  {
    key: 'baratheon', banners: ['Seaworth', 'Tarth', 'Dondarrion', 'Selmy', 'Swann', 'Caron', 'Estermont'], name: 'Baratheon', words: 'Ours Is the Fury', seat: "Storm's End",
    region: 'The Stormlands', beast: 'Crowned Stag',
    c1: '#f0c33c', c2: '#17171b', accent: '#ffe08a',
    heads: ['Robert, First of His Name', 'Stannis, the Rightful King', 'Renly the Charming'],
    blurb: 'A rebel house crowned by a warhammer. Robert won a kingdom he did not want, Stannis wanted a kingdom he could not win, and Renly wanted the crown for the party. Three brothers, three claims, and a bloodline that ends in ash.',
    fact: 'Every trueborn Baratheon is born black of hair. That single sentence in a dusty book started a war.'
  },
  {
    key: 'greyjoy', banners: ['Harlaw', 'Botley', 'Blacktyde', 'Drumm', 'Goodbrother', 'Merlyn'], name: 'Greyjoy', words: 'We Do Not Sow', seat: 'Pyke',
    region: 'The Iron Islands', beast: 'Kraken',
    c1: '#c8ad5f', c2: '#101418', accent: '#e5d59a',
    heads: ['Balon Greyjoy', 'Euron Crow\'s Eye', 'Yara Greyjoy'],
    blurb: 'Reavers who take what is theirs with salt and iron. What is dead may never die — but rises again, harder and stronger. Their god lives under the sea and their politics are settled by a kingsmoot and a very sharp axe.',
    fact: 'Theon Greyjoy was raised a Stark hostage. That contradiction is the whole tragedy of the Iron Islands in one man.'
  },
  {
    key: 'tyrell', banners: ['Tarly', 'Hightower', 'Redwyne', 'Florent', 'Fossoway', 'Rowan', 'Oakheart'], name: 'Tyrell', words: 'Growing Strong', seat: 'Highgarden',
    region: 'The Reach', beast: 'Golden Rose',
    c1: '#4caf50', c2: '#c9a227', accent: '#a5e8a8',
    heads: ['Olenna, the Queen of Thorns', 'Mace Tyrell', 'Margaery, thrice a queen'],
    blurb: 'The richest larder in Westeros and the sharpest tongue. The Tyrells never won a war they could win with a wedding instead — and their matriarch out-schemed every man at the table right up to the cup she drank from last.',
    fact: 'Olenna\'s last act was to confess to murdering Joffrey — to the man who would have to carry the news to his sister. "Tell Cersei. I want her to know it was me."'
  },
  {
    key: 'martell', banners: ['Yronwood', 'Dayne', 'Fowler', 'Blackmont', 'Uller', 'Manwoody', 'Wyl'], name: 'Martell', words: 'Unbowed, Unbent, Unbroken', seat: 'Sunspear',
    region: 'Dorne', beast: 'Sun and Spear',
    c1: '#ff8a2b', c2: '#a3231a', accent: '#ffbf6a',
    heads: ['Doran Martell', 'Oberyn, the Red Viper', 'Ellaria Sand'],
    blurb: 'The one kingdom the dragons never conquered — Dorne bent to Aegon by marriage, not by fire. Sun-bleached, snake-quick, and long-memoried. They hold grudges in generations, not years.',
    fact: 'Oberyn had won. He had the Mountain down, the spear in him, a confession on his lips. He just would not stop talking.'
  },
  {
    key: 'arryn', banners: ['Royce', 'Corbray', 'Waynwood', 'Templeton', 'Hunter', 'Redfort', 'Belmore'], name: 'Arryn', words: 'As High as Honor', seat: 'The Eyrie',
    region: 'The Vale', beast: 'Falcon and Moon',
    c1: '#8fd3f4', c2: '#1c3b57', accent: '#d6f1ff',
    heads: ['Jon Arryn, Hand of the King', 'Lysa Arryn', 'Robin Arryn'],
    blurb: 'A castle in the clouds that has never fallen, reached by a stair that kills more men than any army. The Vale sat out the war entirely — and then rode down the hill at the exact moment it mattered most.',
    fact: 'The Moon Door: a hole in the floor of the throne room with six hundred feet of sky beneath it. "Fly."'
  },
  {
    key: 'tully', banners: ['Frey', 'Blackwood', 'Bracken', 'Mallister', 'Piper', 'Vance', 'Darry', 'Mooton'], name: 'Tully', words: 'Family, Duty, Honor', seat: 'Riverrun',
    region: 'The Riverlands', beast: 'Leaping Trout',
    c1: '#4b8ec9', c2: '#9b1c2e', accent: '#a9d6f5',
    heads: ['Hoster Tully', 'Brynden "the Blackfish"', 'Edmure Tully'],
    blurb: 'The crossroads of Westeros — which means every army in the Seven Kingdoms marches across them. Their words put family first, and it is family that costs them everything at a wedding on the Green Fork.',
    fact: 'The order of the words matters: Family. Duty. Honor. Catelyn Stark lived and died by exactly that order.'
  }
];

const MINOR_HOUSES = [
  { key: 'bolton', name: 'Bolton', words: 'Our Blades Are Sharp', seat: 'The Dreadfort', c1: '#c04a4a', c2: '#1a1214' },
  { key: 'mormont', name: 'Mormont', words: 'Here We Stand', seat: 'Bear Island', c1: '#9aa6ad', c2: '#1c2226' },
  { key: 'watch', name: "Night's Watch", words: 'And Now My Watch Begins', seat: 'Castle Black', c1: '#20242a', c2: '#6f7d88' }
];

/* -------------------------------------------------------------------------- */

const SEASONS = [
  {
    n: 1, year: 2011, eps: 10, title: 'Winter Is Coming',
    tag: 'The game begins — and the man who refuses to play it loses first.',
    mood: 'stark',
    events: [
      'Ned Stark rides south to serve as Hand to King Robert, against every instinct he has.',
      'Bran sees what he should not have seen and is thrown from a tower window.',
      'Daenerys is sold to Khal Drogo and, somewhere on the Dothraki sea, stops being a girl who is given away.',
      'Ned works out the secret in the book: Joffrey is no Baratheon. He gives Cersei a chance to run. She does not.',
      'On the steps of the Great Sept of Baelor, Ilyn Payne swings Ice. The protagonist dies in episode nine.',
      'Robb is proclaimed King in the North. Daenerys walks into her husband\'s pyre and walks out with three dragons.'
    ],
    hero: 'Ned Stark', close: 'The dragons are back in the world. Nobody in Westeros knows it yet.'
  },
  {
    n: 2, year: 2012, eps: 10, title: 'The War of the Five Kings',
    tag: 'Five crowns, one throne, and a bay full of green fire.',
    mood: 'wildfire',
    events: [
      'Robb, Stannis, Renly, Joffrey and Balon all claim a crown. The realm tears itself into fifths.',
      'A shadow with Stannis\'s face murders Renly in his own tent.',
      'Arya, hiding in plain sight at Harrenhal, serves Tywin Lannister his supper every night.',
      'Theon takes Winterfell to prove he is Greyjoy and burns two farm boys to keep the lie.',
      'Tyrion, acting Hand, holds King\'s Landing with wildfire and a chain across the Blackwater.',
      'Beyond the Wall, the dead are stirring. The season ends on a wight army marching, ten thousand strong.'
    ],
    hero: 'Tyrion Lannister', close: '"Those are brave men knocking at our door. Let\'s go kill them."'
  },
  {
    n: 3, year: 2013, eps: 10, title: 'The Rains of Castamere',
    tag: 'The season television did not recover from.',
    mood: 'blood',
    events: [
      'Jaime Lannister loses his sword hand and, with it, the only thing he ever knew how to be.',
      'Daenerys buys the Unsullied with a dragon, then says one word — dracarys — and takes Astapor for free.',
      'Jon Snow goes over the Wall with the Free Folk and falls in love with Ygritte, who knows nothing about him.',
      'Robb marries for love and breaks a promise to Walder Frey. The Freys are a patient people.',
      'At the Twins, the band strikes up a Lannister drinking song. The doors close. Catelyn sees it a heartbeat before anyone else.',
      'Grey Worm, the Unsullied, and forty thousand freed slaves lift Daenerys above their heads: mhysa.'
    ],
    hero: 'Robb Stark', close: 'The Red Wedding. Episode nine. It is always episode nine.'
  },
  {
    n: 4, year: 2014, eps: 10, title: 'The Lion and the Viper',
    tag: 'Justice, trial by combat, and the sound a skull makes.',
    mood: 'lannister',
    events: [
      'Joffrey chokes to death purple-faced at his own wedding feast. Nobody in the Seven Kingdoms mourns him honestly.',
      'Tyrion is framed for it and demands a trial by combat, having no champion and no friends left.',
      'Oberyn Martell volunteers — he has waited seventeen years to make the Mountain say a name aloud.',
      'At the Wall, a hundred brothers hold Castle Black against Mance Rayder\'s hundred thousand.',
      'Brienne and the Hound fight over Arya on a hilltop, and Arya walks away from both of them.',
      'Tyrion finds his father on the privy and a crossbow on the wall. "You are no son of mine." He is, though.'
    ],
    hero: 'Tyrion Lannister', close: 'Arya buys passage to Braavos with an iron coin. Valar morghulis.'
  },
  {
    n: 5, year: 2015, eps: 10, title: 'Hardhome',
    tag: 'The war everyone is fighting is the wrong war.',
    mood: 'ice',
    events: [
      'Daenerys rules Meereen and learns that taking a city is the easy half.',
      'Jon sails to Hardhome to evacuate the Free Folk — and the dead arrive first.',
      'The Night King walks unhurried through the surf, raises his arms, and every corpse on the beach sits up.',
      'Stannis burns his own daughter alive for a favourable wind. He gets snow instead.',
      'Cersei walks naked from the Great Sept to the Red Keep while the city screams shame at her.',
      'Jon\'s own brothers put their knives in him, one after another. "For the Watch."'
    ],
    hero: 'Jon Snow', close: 'Longclaw falls in the snow. The blood on it is black in the torchlight.'
  },
  {
    n: 6, year: 2016, eps: 10, title: 'Hold the Door',
    tag: 'The dead come back. So does the debt.',
    mood: 'green',
    events: [
      'Melisandre, out of faith and out of ideas, brings Jon Snow back anyway.',
      'Bran greensees too greedily, and a stableboy named Wylis is broken across time so a door can be held.',
      'Arya finishes her training in Braavos, refuses the Faceless Men, and takes back her name.',
      'Jon and Ramsay meet on an open field. Jon nearly suffocates under his own men before the Vale rides in.',
      'Cersei loses her trial and answers it with a cellar full of wildfire under the Great Sept.',
      'At the Tower of Joy, Bran hears Lyanna whisper a name — and Jon Snow stops being a bastard.'
    ],
    hero: 'Sansa Stark', close: 'Daenerys sails west with a fleet, three dragons, and every ally she ever made.'
  },
  {
    n: 7, year: 2017, eps: 7, title: 'The Spoils of War',
    tag: 'Fire lands in Westeros. Ice comes down the Wall.',
    mood: 'fire',
    events: [
      'Daenerys takes Dragonstone — the castle she was born under, empty and waiting.',
      'On the Roseroad, Drogon comes over the hill low and screaming and the Lannister loot train stops existing.',
      'Seven men walk beyond the Wall to catch a corpse and prove a point to a woman who does not care.',
      'The Night King throws an ice spear. Viserion falls out of the sky into a frozen lake.',
      'Every enemy in the world meets in the Dragonpit and looks at a wight in a box.',
      'Viserion, blue-eyed now, breathes and the Wall comes down at Eastwatch after eight thousand years.'
    ],
    hero: 'Daenerys Targaryen', close: 'The army of the dead walks into the North, unhurried, in perfect silence.'
  },
  {
    n: 8, year: 2019, eps: 6, title: 'The Long Night',
    tag: 'Everything ends. Not everyone agrees on how.',
    mood: 'night',
    events: [
      'The living gather at Winterfell — Stark, Targaryen, Lannister, Free Folk, Unsullied, Dothraki.',
      'The Long Night: 55 nights of filming, one hour of darkness, and the Dothraki charge that goes out like candles.',
      'The Night King reaches the godswood, reaches for Bran — and Arya drops out of the dark with a catspaw dagger.',
      'The Bells: King\'s Landing surrenders, the bells ring, and Daenerys burns the city anyway.',
      'Jon kills the woman he loves in the throne room. Drogon melts the Iron Throne into slag and carries her away.',
      'Bran the Broken is chosen king by a council of lords. Sansa takes the North. Arya sails west of Westeros.'
    ],
    hero: 'Arya Stark', close: 'Jon rides north through the gate with the Free Folk. The last shot is green.'
  }
];

/* -------------------------------------------------------------------------- */

const MOMENTS = [
  {
    id: 'ned', label: 'S1 · E9 — Baelor', title: 'The Head of Eddard Stark',
    fx: 'blood', scene: 'crowd',      sceneSeed: 11,
    text: 'He confessed to treason he never committed to keep his daughters alive. Joffrey called for his head anyway, because he could. Arya was in the crowd. Yoren covered her eyes.',
    quote: 'The man who passes the sentence should swing the sword.',
    who: 'Eddard Stark',
    note: 'The moment the audience learned this show would not protect anyone.'
  },
  {
    id: 'birth', label: 'S1 · E10 — Fire and Blood', title: 'The Dragons Are Born',
    fx: 'fire', scene: 'pyre',       sceneSeed: 22,
    text: 'She walked into her husband\'s funeral pyre carrying three stone eggs and a witch, and in the morning the ashes were cold and she was not burned. Three newborn dragons clung to her, screaming at a world that had written them off three centuries ago.',
    quote: 'I am the blood of the dragon. I must be strong.',
    who: 'Daenerys Targaryen',
    note: 'Magic returns to the world in the last ninety seconds of season one.'
  },
  {
    id: 'blackwater', label: 'S2 · E9 — Blackwater', title: 'Green Fire on the Bay',
    fx: 'wildfire', scene: 'skyline',    sceneSeed: 33, sceneOpts: { green: true },
    text: 'Stannis brought two hundred ships up the Blackwater Rush. Tyrion answered with one ship full of wildfire and a single flaming arrow. The bay turned emerald and the sound the fleet made is not something a person forgets.',
    quote: "I'm going to die here.",
    who: 'Tyrion Lannister',
    note: 'The first episode of television that made a fantasy siege feel like a war film.'
  },
  {
    id: 'redwedding', label: 'S3 · E9 — The Rains of Castamere', title: 'The Red Wedding',
    fx: 'blood', scene: 'hall',       sceneSeed: 44, sceneOpts: { banner: 'rgba(80,14,16,0.6)' },
    text: 'A wedding, a guest right, bread and salt. Then the doors shut, the musicians in the gallery put down their instruments and picked up crossbows, and Catelyn Stark pulled back Roose Bolton\'s sleeve and found chainmail underneath.',
    quote: 'The Lannisters send their regards.',
    who: 'Roose Bolton',
    note: 'Millions filmed themselves watching it. Nobody has topped it since.'
  },
  {
    id: 'purple', label: 'S4 · E2 — The Lion and the Rose', title: 'The Purple Wedding',
    fx: 'poison', scene: 'hall',       sceneSeed: 55, sceneOpts: { banner: 'rgba(90,70,16,0.5)' },
    text: 'The most hated boy in fiction choked on a poisoned cup at his own feast, clawing at his throat while his mother screamed and his uncle was dragged away in chains for it. The murderer was an old woman who had already told us she would do it.',
    quote: 'Tell Cersei. I want her to know it was me.',
    who: 'Olenna Tyrell',
    note: 'Two seasons of accumulated loathing, paid out in ninety seconds.'
  },
  {
    id: 'viper', label: 'S4 · E8 — The Mountain and the Viper', title: 'The Red Viper',
    fx: 'blood', scene: 'crowd',      sceneSeed: 66,
    text: 'He fought like water — fast, circling, spear flicking. He had the Mountain on his back with a spear through him. He only needed a confession. He asked for it one time too many.',
    quote: 'You raped her. You murdered her. You killed her children.',
    who: 'Oberyn Martell',
    note: 'The show taught us that being right and being clever is not the same as winning.'
  },
  {
    id: 'hardhome', label: 'S5 · E8 — Hardhome', title: 'The Night King Raises His Arms',
    fx: 'ice', scene: 'wall',       sceneSeed: 77,
    text: 'The gates closed on thousands still outside. Jon Snow, in a boat pulling away, watched the Night King step down to the water\'s edge, look him dead in the eye, and lift both arms. Every body on that beach stood up.',
    quote: '',
    who: '',
    note: 'The politics stopped mattering for eleven minutes and never fully mattered again.'
  },
  {
    id: 'hodor', label: 'S6 · E5 — The Door', title: 'Hold the Door',
    fx: 'ice', scene: 'godswood',   sceneSeed: 88,
    text: 'Bran reached back through time into a boy in a Winterfell stableyard, and the boy seized, eyes white, hearing a scream from decades in the future. Hold the door. Hold the door. Hold door. Hodor.',
    quote: 'Hold the door!',
    who: 'Meera Reed',
    note: 'A six-season-old joke revealed as a lifelong sentence.'
  },
  {
    id: 'bastards', label: 'S6 · E9 — Battle of the Bastards', title: 'One Man Against Cavalry',
    fx: 'dust', scene: 'battlefield',sceneSeed: 99,
    text: 'Rickon ran and the arrows found him. Jon stood alone on open ground and drew his sword against a charge, and then the battle became a crush — a mound of bodies, boots on his chest, no air, no sky. Then horns, and the Knights of the Vale.',
    quote: 'Your words will disappear. Your house will disappear. Your name will disappear.',
    who: 'Sansa Stark',
    note: '600 crew, 500 extras, 70 horses, 25 days of shooting.'
  },
  {
    id: 'sept', label: 'S6 · E10 — The Winds of Winter', title: 'Light of the Seven',
    fx: 'wildfire', scene: 'skyline',    sceneSeed: 111, sceneOpts: { green: true },
    text: 'Ten minutes of piano and no dialogue. Green light under the floorboards, a boy in a crown at a window, sparrows in the sept — and then the whole hill goes up in a column of emerald fire and Cersei pours herself a drink.',
    quote: 'Shame. Shame. Shame.',
    who: 'The Faith Militant',
    note: 'The first time a piano was ever used in the score. It is the best ten minutes of the series.'
  },
  {
    id: 'loottrain', label: 'S7 · E4 — The Spoils of War', title: 'Dracarys on the Roseroad',
    fx: 'fire', scene: 'battlefield',sceneSeed: 122, sceneOpts: { fire: true },
    text: 'A Dothraki horde comes over the ridge screaming, and behind them, low and enormous, comes Drogon. Jaime Lannister watched an army he understood turn into a wall of fire he did not, and rode a horse at a dragon anyway.',
    quote: 'Dracarys.',
    who: 'Daenerys Targaryen',
    note: '20 stuntmen were set on fire — a record for a single production.'
  },
  {
    id: 'longnight', label: 'S8 · E3 — The Long Night', title: 'Not Today',
    fx: 'ice', scene: 'godswood',   sceneSeed: 133,
    text: 'The Night King walked into the godswood with the whole war behind him and reached for Bran. Arya came out of the dark, was caught by the throat, dropped the dagger from one hand — and caught it in the other.',
    quote: 'What do we say to the God of Death? Not today.',
    who: 'Syrio Forel',
    note: 'A sword lesson from season one, cashed in eight years later.'
  },
  {
    id: 'bells', label: 'S8 · E5 — The Bells', title: 'The Bells',
    fx: 'fire', scene: 'skyline',    sceneSeed: 144,
    text: 'The gates opened. The swords went down. The bells rang surrender across King\'s Landing. Daenerys sat on Drogon above it all, looked at the Red Keep, and decided that mercy had never bought her anything.',
    quote: '',
    who: '',
    note: 'The most argued-about hour of television of the decade.'
  },
  {
    id: 'throne', label: 'S8 · E6 — The Iron Throne', title: 'The Throne Melts',
    fx: 'fire', scene: 'hall',       sceneSeed: 155, sceneOpts: { warm: false },
    text: 'Jon put a knife in her while he kissed her. Drogon nosed at her body, then turned on the chair — a thousand swords surrendered to Aegon, forged in dragonfire — and unmade it. He knew what killed her, and it was not a man.',
    quote: 'Love is the death of duty.',
    who: 'Maester Aemon',
    note: 'The object everyone died for is destroyed by the only creature with no interest in sitting on it.'
  }
];

/* -------------------------------------------------------------------------- */

const CHARACTERS = [
  { name: 'Jon Snow', actor: 'Kit Harington', house: 'stark', title: 'The Bastard of Winterfell · King in the North · Aegon Targaryen',
    quote: 'I don\'t want it. I never have.', fate: 'Exiled beyond the Wall. Rode north with the Free Folk.', alive: true },
  { name: 'Daenerys Targaryen', actor: 'Emilia Clarke', house: 'targaryen', title: 'Stormborn · Mother of Dragons · Breaker of Chains',
    quote: 'I will take what is mine with fire and blood.', fate: 'Killed by Jon Snow in the throne room.', alive: false },
  { name: 'Tyrion Lannister', actor: 'Peter Dinklage', house: 'lannister', title: 'The Imp · Hand of the King, twice over',
    quote: 'I drink and I know things.', fate: 'Hand of the King to Bran the Broken.', alive: true },
  { name: 'Arya Stark', actor: 'Maisie Williams', house: 'stark', title: 'No One · A Girl Has a Name',
    quote: 'Stick them with the pointy end.', fate: 'Sailed west of Westeros to find what is there.', alive: true },
  { name: 'Cersei Lannister', actor: 'Lena Headey', house: 'lannister', title: 'Queen Regent · First of Her Name',
    quote: 'When you play the game of thrones, you win or you die.', fate: 'Crushed beneath the Red Keep with Jaime.', alive: false },
  { name: 'Eddard Stark', actor: 'Sean Bean', house: 'stark', title: 'Lord of Winterfell · Hand of the King',
    quote: 'The man who passes the sentence should swing the sword.', fate: 'Beheaded on the steps of Baelor. Season one.', alive: false },
  { name: 'Sansa Stark', actor: 'Sophie Turner', house: 'stark', title: 'Queen in the North',
    quote: 'I\'m a slow learner, it\'s true. But I learn.', fate: 'Crowned Queen of an independent North.', alive: true },
  { name: 'Jaime Lannister', actor: 'Nikolaj Coster-Waldau', house: 'lannister', title: 'The Kingslayer · Lord Commander of the Kingsguard',
    quote: 'The things I do for love.', fate: 'Died in the cellars holding his sister.', alive: false },
  { name: 'Tywin Lannister', actor: 'Charles Dance', house: 'lannister', title: 'Lord of Casterly Rock · Hand of the King',
    quote: 'A lion does not concern himself with the opinion of sheep.', fate: 'Shot on the privy by his youngest son.', alive: false },
  { name: 'Brienne of Tarth', actor: 'Gwendoline Christie', house: 'baratheon', title: 'Ser Brienne · Lord Commander of the Kingsguard',
    quote: 'All my life men like you have sneered at me. And all my life I\'ve been knocking men like you into the dust.', fate: 'Wrote Jaime\'s page in the White Book herself.', alive: true },
  { name: 'The Hound', actor: 'Rory McCann', house: 'lannister', title: 'Sandor Clegane',
    quote: 'Hate is as good a thing as any to keep a man going.', fate: 'Took his brother off the stairs into the fire.', alive: false },
  { name: 'Bran Stark', actor: 'Isaac Hempstead Wright', house: 'stark', title: 'The Three-Eyed Raven · Bran the Broken',
    quote: 'I remember everything.', fate: 'Elected King of the Six Kingdoms.', alive: true },
  { name: 'Melisandre', actor: 'Carice van Houten', house: 'targaryen', title: 'The Red Woman · Priestess of R\'hllor',
    quote: 'The night is dark and full of terrors.', fate: 'Dropped her necklace at dawn and turned to dust.', alive: false },
  { name: 'Ygritte', actor: 'Rose Leslie', house: 'watch', title: 'Free Folk · Spearwife',
    quote: 'You know nothing, Jon Snow.', fate: 'Died in his arms at Castle Black.', alive: false },
  { name: 'Joffrey Baratheon', actor: 'Jack Gleeson', house: 'lannister', title: 'First of His Name · King of the Andals',
    quote: 'Everyone is mine to torment.', fate: 'Poisoned at his own wedding feast.', alive: false },
  { name: 'Olenna Tyrell', actor: 'Diana Rigg', house: 'tyrell', title: 'The Queen of Thorns',
    quote: 'I\'ve known a great many clever men. I\'ve outlived them all.', fate: 'Drank the poison, then named herself the murderer.', alive: false },
  { name: 'Oberyn Martell', actor: 'Pedro Pascal', house: 'martell', title: 'The Red Viper of Dorne',
    quote: 'Elia Martell! You raped her. You murdered her.', fate: 'Killed by the Mountain in trial by combat.', alive: false },
  { name: 'Theon Greyjoy', actor: 'Alfie Allen', house: 'greyjoy', title: 'Ward of Winterfell · Reek · Ironborn',
    quote: 'You taught me how to be a man.', fate: 'Charged the Night King alone in the godswood.', alive: false },
  { name: 'Samwell Tarly', actor: 'John Bradley', house: 'watch', title: 'Sam the Slayer · Grand Maester',
    quote: 'I\'m the first man to kill a White Walker in a thousand years.', fate: 'Grand Maester. Wrote the book, and named it.', alive: true },
  { name: 'The Night King', actor: 'Vladimír Furdík', house: 'watch', title: 'First of the White Walkers',
    quote: '', fate: 'Shattered by a Valyrian steel dagger in the godswood.', alive: false }
];

/* -------------------------------------------------------------------------- */

const QUOTES = [
  { t: 'When you play the game of thrones, you win or you die. There is no middle ground.', w: 'Cersei Lannister', h: 'lannister' },
  { t: 'A mind needs books as a sword needs a whetstone, if it is to keep its edge.', w: 'Tyrion Lannister', h: 'lannister' },
  { t: 'Winter is coming.', w: 'House Stark', h: 'stark' },
  { t: 'The night is dark and full of terrors.', w: 'Melisandre', h: 'targaryen' },
  { t: 'Chaos isn\'t a pit. Chaos is a ladder.', w: 'Petyr Baelish', h: 'arryn' },
  { t: 'Valar morghulis. All men must die.', w: 'Jaqen H\'ghar', h: 'watch' },
  { t: 'Never forget what you are. The rest of the world will not. Wear it like armour, and it can never be used to hurt you.', w: 'Tyrion Lannister', h: 'lannister' },
  { t: 'The North remembers.', w: 'House Stark', h: 'stark' },
  { t: 'A lion does not concern himself with the opinion of sheep.', w: 'Tywin Lannister', h: 'lannister' },
  { t: 'What do we say to the God of Death? Not today.', w: 'Syrio Forel', h: 'stark' },
  { t: 'Power resides where men believe it resides. It is a trick, a shadow on the wall.', w: 'Varys', h: 'targaryen' },
  { t: 'Bran the Broken. He will never father children. Good. I never want another child.', w: 'Tyrion Lannister', h: 'stark' },
  { t: 'You know nothing, Jon Snow.', w: 'Ygritte', h: 'watch' },
  { t: 'There is only one god, and his name is Death. And there is only one thing we say to Death: not today.', w: 'Syrio Forel', h: 'stark' },
  { t: 'Every flight begins with a fall.', w: 'The Three-Eyed Raven', h: 'stark' },
  { t: 'Dracarys.', w: 'Daenerys Targaryen', h: 'targaryen' }
];

/* -------------------------------------------------------------------------- */

const STATS = [
  { n: 8,   label: 'Seasons',              suffix: '',  note: '2011 — 2019' },
  { n: 73,  label: 'Episodes',             suffix: '',  note: 'Winter Is Coming → The Iron Throne' },
  { n: 59,  label: 'Emmy Awards',          suffix: '',  note: 'Most-awarded scripted series in history' },
  { n: 160, label: 'Emmy Nominations',     suffix: '',  note: '32 in the final season alone' },
  { n: 19,  label: 'Million Viewers',      suffix: '.3M', raw: true, note: 'US audience for the series finale' },
  { n: 10,  label: 'Countries Filmed',     suffix: '',  note: 'N. Ireland · Croatia · Iceland · Spain · Malta · Morocco' },
  { n: 55,  label: 'Night Shoots',         suffix: '',  note: 'To film The Long Night — a record' },
  { n: 4000, label: 'Crew & Cast',         suffix: '+', note: 'At the production\'s peak' },
  { n: 4,   label: 'Best Drama Emmys',     suffix: '',  note: '2015 · 2016 · 2018 · 2019' },
  { n: 5,   label: 'Novels So Far',        suffix: '',  note: 'A Song of Ice and Fire, still unfinished' }
];

const MUSIC_NOTES = [
  { title: 'Main Title', by: 'Ramin Djawadi · 2011',
    text: 'A cello ostinato in a minor key over a clockwork map. Djawadi wrote it after seeing the title sequence animatic — the music is built to match gears turning. It is the reason you never skip the intro.' },
  { title: 'The Rains of Castamere', by: 'Lyrics by George R. R. Martin · 2011',
    text: 'The Lannister theme, and the last thing a great many characters ever hear. Once you learn what it means, the show weaponises it: the second those strings start, someone is about to die.' },
  { title: 'Light of the Seven', by: 'Season 6 finale · 2016',
    text: 'The first piano in six seasons of scoring. Ten minutes, almost no dialogue, building organ and strings under green light — the score does the whole job of the scene.' },
  { title: 'The Night King', by: 'Season 8 · 2019',
    text: 'Piano and strings under the godswood, holding one enormous breath. Djawadi conducted a 90-piece orchestra for the final season, the largest the show ever used.' }
];

const PRODUCTION = [
  { k: 'Created by', v: 'David Benioff & D. B. Weiss' },
  { k: 'Based on', v: 'A Song of Ice and Fire by George R. R. Martin' },
  { k: 'Network', v: 'HBO' },
  { k: 'Premiere', v: '17 April 2011 — "Winter Is Coming"' },
  { k: 'Finale', v: '19 May 2019 — "The Iron Throne"' },
  { k: 'Composer', v: 'Ramin Djawadi' },
  { k: 'Principal filming', v: 'Northern Ireland (Titanic Studios, Belfast)' },
  { k: 'Doubling for the North', v: 'Iceland — Svínafellsjökull, Þingvellir, Mývatn' },
  { k: "Doubling for King's Landing", v: 'Dubrovnik, Croatia' },
  { k: 'Doubling for Dorne', v: 'Alcázar of Seville, Spain' },
  { k: 'Doubling for Meereen', v: 'Aït Benhaddou & Essaouira, Morocco' }
];
