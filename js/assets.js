/* ==========================================================================
   assets.js — the drop-in layer.

   Everything on this page is generated in code and stands on its own. But
   every generated thing also has a slot: put a file in assets/, name it in
   assets/manifest.json, and it takes over.

   assets/manifest.json — all paths are relative to assets/

   {
     "audio":  "theme.mp3",
     "throne": "img/iron-throne.png",

     "scenes": {                          // full-bleed backdrops
       "redwedding": "img/red-wedding.jpg",
       "bells":      "img/kings-landing.jpg",
       "dragons":    "img/drogon.jpg"
     },

     "sigils": {                          // house emblems, everywhere they appear
       "stark":     "sigils/stark.png",
       "lannister": "sigils/lannister.png"
     },

     "cast": {                            // character portraits, keyed by name
       "Jon Snow":  "cast/jon-snow.jpg",
       "Arya Stark":"cast/arya.jpg"
     }
   }

   Anything absent keeps what the code draws, so a partial manifest is fine.
   One quiet 404 if the file doesn't exist at all.
   ========================================================================== */

const Assets = (() => {
  let data = {};

  const ready = fetch('assets/manifest.json')
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null)
    .then(j => { data = j || {}; return data; });

  /* keep everything inside assets/ — a manifest shouldn't be able to point
     the page at an arbitrary path */
  const path = p => {
    if (!p || typeof p !== 'string') return null;
    const clean = p.replace(/^[/\\]+/, '').replace(/\.\.[/\\]/g, '');
    return 'assets/' + clean;
  };

  const from = (group, key) => path((data[group] || {})[key]);

  return {
    ready,
    get raw() { return data; },
    scene:  id => from('scenes', id),
    sigil:  k  => from('sigils', k),
    cast:   n  => from('cast', n),
    throne: () => path(data.throne),
    audio:  () => path(data.audio) || 'assets/theme.mp3',
    has:    group => !!(data[group] && Object.keys(data[group]).length)
  };
})();
