import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PageRoute } from '../types';

/**
 * Minimal history-based router. URLs come from the menu tree, not from code:
 *   /                 home
 *   /{slug}           a menu entry (category)
 *   /bai-viet/{slug}  a post – independent of its category, so moving entries never breaks links
 */

export const POST_PREFIX = 'bai-viet';

export const routeToPath = (route: PageRoute): string => {
  switch (route.view) {
    case 'home':
      return '/';
    case 'category':
      return `/${route.slug}`;
    case 'post':
      return `/${POST_PREFIX}/${route.slug}`;
  }
};

export const pathToRoute = (pathname: string): PageRoute | null => {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (segments.length === 0) return { view: 'home' };
  if (segments.length === 1 && segments[0] !== POST_PREFIX) return { view: 'category', slug: segments[0] };
  if (segments.length === 2 && segments[0] === POST_PREFIX) return { view: 'post', slug: segments[1] };
  return null;
};

interface RouterValue {
  route: PageRoute | null;
  navigate: (route: PageRoute, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue>({ route: { view: 'home' }, navigate: () => undefined });

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<PageRoute | null>(() => pathToRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: PageRoute, options?: { replace?: boolean }) => {
    const path = routeToPath(next);
    if (path !== window.location.pathname) {
      if (options?.replace) window.history.replaceState({}, '', path);
      else window.history.pushState({}, '', path);
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = () => useContext(RouterContext);

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: PageRoute;
}

/** Real <a href> (open-in-new-tab works) that navigates client-side on a plain click. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ to, onClick, ...rest }, ref) => {
  const { navigate } = useRouter();
  return (
    <a
      ref={ref}
      href={routeToPath(to)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        navigate(to);
      }}
      {...rest}
    />
  );
});
Link.displayName = 'Link';
