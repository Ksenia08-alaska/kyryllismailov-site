import { gsap } from 'gsap';

/** Буквы большого логотипа в футере поднимаются волной. */
export function initFooter() {
  const word = document.querySelector<HTMLElement>('[data-footer-word]');
  if (!word) return;
  gsap.from(word.children, {
    yPercent: 100,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.035,
    scrollTrigger: { trigger: word, start: 'top 98%' },
  });
}
