import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Open every new page at the top.
 *
 * A single-page app keeps the scroll position when the URL changes, so clicking
 * a route halfway down a destination page dropped you into the middle of the
 * next one. Going back is left alone: the browser restores that position itself,
 * and jumping to the top there would lose your place in a long list.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, navigationType]);

  return null;
}
