import { useCallback, useSyncExternalStore } from 'react';

/** Live result of a CSS media query: re-renders when it flips (resize, rotation, OS settings). */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};

/** Tailwind's `lg` breakpoint: below it, home-page lists become swipeable carousels. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
