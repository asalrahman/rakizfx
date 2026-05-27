'use client';

import { useEffect, useState } from 'react';

export function useReveal(): void {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

export function useTicker(initial: number, jitter = 0.0005, ms = 1400): number {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => {
      setVal((v) => {
        const drift = (Math.random() - 0.5) * 2 * jitter * initial;
        return v + drift;
      });
    }, ms + Math.random() * 600);
    return () => clearInterval(t);
  }, [initial, jitter, ms]);
  return val;
}

export type Route =
  | 'home'
  | 'markets'
  | 'accounts'
  | 'funding'
  | 'tools'
  | 'academy'
  | 'partners'
  | 'affiliate'
  | 'promotion'
  | 'careers'
  | 'help'
  | 'about'
  | 'faq'
  | 'contact'
  | 'register'
  | 'login';

export const ROUTES: Route[] = [
  'home', 'markets', 'accounts', 'funding', 'tools', 'academy',
  'partners', 'affiliate', 'promotion', 'careers', 'help', 'about',
  'faq', 'contact', 'register', 'login',
];

export function useRoute(): [Route, (r: Route) => void] {
  const getHash = (): Route => {
    if (typeof window === 'undefined') return 'home';
    const h = (window.location.hash || '#home').replace(/^#/, '').split('?')[0] as Route;
    return ROUTES.includes(h) ? h : 'home';
  };
  const [route, setRoute] = useState<Route>(getHash());
  useEffect(() => {
    const fn = () => setRoute(getHash());
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  const nav = (r: Route) => {
    window.location.hash = '#' + r;
    setRoute(r);
  };
  return [route, nav];
}
