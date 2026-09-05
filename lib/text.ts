/** True if the string contains any Devanagari. Used to pick the right face. */
export const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);

/**
 * Titles are mixed-script — "Believe" and "हर हर महादेव" sit in the same list.
 * Fraunces has no Devanagari, so a Devanagari title in the display face falls
 * back to whatever the OS happens to have. Pick the face per string instead.
 */
export const titleFace = (s: string) => (hasDevanagari(s) ? 'u-deva' : 'u-display');
