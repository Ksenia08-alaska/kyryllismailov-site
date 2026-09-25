import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Плавный скролл Lenis, синхронизированный с GSAP. */
export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Якорные ссылки прокручиваются плавно
  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.4 });
    history.replaceState(null, '', id);
  });

  return lenis;
}

export type LenisInstance = Lenis;
