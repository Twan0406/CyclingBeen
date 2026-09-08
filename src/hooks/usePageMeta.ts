import { useEffect } from 'react';

function setTag(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(attrs)) {
      if (k !== 'content') el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  }
  if (attrs.content) el.setAttribute('content', attrs.content);
}

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
}

/**
 * Sets the document title and social/search meta for the current page.
 *
 * This makes shared links render properly and gives each route a real title.
 * Search engines that don't run JavaScript still need the pre-rendering step,
 * which is tracked separately in MVP2-PLAN.md.
 */
export function usePageMeta({ title, description, image }: PageMeta) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;

    if (description) {
      setTag('meta[name="description"]', { name: 'description', content: description });
      setTag('meta[property="og:description"]', { property: 'og:description', content: description });
    }
    setTag('meta[property="og:title"]', { property: 'og:title', content: title });
    setTag('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setTag('meta[property="og:url"]', { property: 'og:url', content: window.location.href });
    setTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    if (image) {
      setTag('meta[property="og:image"]', { property: 'og:image', content: image });
    }

    return () => {
      document.title = previous;
    };
  }, [title, description, image]);
}
