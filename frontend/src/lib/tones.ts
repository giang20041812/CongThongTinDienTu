import type React from 'react';

/** A colour accent: a gradient (from → to) plus a darker shade that stays readable as text on white. */
export interface Tone {
  from: string;
  to: string;
  ink: string;
}

/**
 * Accents that spread colour across the home page beside the logo's navy, gold and flame.
 * Ordered so neighbours contrast: cards, tiles and carousel dots cycle through them.
 */
export const TONES: readonly Tone[] = [
  { from: '#3b82f6', to: '#0a4aa0', ink: '#0a4aa0' }, // school blue
  { from: '#f59e0b', to: '#ea580c', ink: '#c2410c' }, // sun gold → orange
  { from: '#22c55e', to: '#15803d', ink: '#15803d' }, // green
  { from: '#8b5cf6', to: '#6d28d9', ink: '#6d28d9' }, // violet
  { from: '#f43f5e', to: '#c8101f', ink: '#be123c' }, // rose → flame
  { from: '#14b8a6', to: '#0e7490', ink: '#0f766e' }, // teal
  { from: '#d946ef', to: '#a21caf', ink: '#a21caf' }, // fuchsia
  { from: '#0ea5e9', to: '#1d4ed8', ink: '#0369a1' }, // sky
];

export const toneAt = (index: number): Tone => TONES[((index % TONES.length) + TONES.length) % TONES.length];

/** Same key, same colour – e.g. a category keeps its tone on every card that shows it. */
export const toneFor = (key: string | null | undefined): Tone => {
  let hash = 0;
  for (const char of key ?? '') hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return toneAt(Math.abs(hash));
};

/** Exposes a tone to CSS, for classes such as `from-(--tone) to-(--tone-2)`, `bg-(--tone)/10` and `text-(--tone-ink)`. */
export const toneStyle = (tone: Tone): React.CSSProperties =>
  ({ '--tone': tone.from, '--tone-2': tone.to, '--tone-ink': tone.ink }) as React.CSSProperties;
