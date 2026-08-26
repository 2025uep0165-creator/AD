# assets/

## Adding your own theme music

The site ships with an **original score synthesised live in the browser** (see
`js/audio.js`) because Ramin Djawadi's Game of Thrones main title is a
copyrighted composition and cannot be redistributed here.

If you own a copy you have the right to use, drop it in this folder as:

```
assets/theme.mp3
```

That's the only step. On load the page probes for that file; if it's there it
plays it on loop instead of the synth, and the "The music" section updates its
label to say so. If it isn't there, the probe 404s harmlessly and the synth
takes over.

Any format your browser can decode works — just keep the filename `theme.mp3`,
or change the path at the top of `Score.tryFile()` in `js/audio.js`.

> Note: the volume is set to 0.55 and the track loops indefinitely. Music that
> loops cleanly (an intro/outro that meets in the middle) sounds best.
