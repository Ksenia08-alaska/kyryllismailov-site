import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Шапка: прячется при скролле вниз, появляется при скролле вверх,
 * получает подложку после начала страницы и меняет цвет над тёмными секциями.
 */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const progress = document.querySelector<HTMLElement>('[data-scroll-progress]');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (progress) progress.style.transform = `scaleX(${self.progress})`;
      const y = self.scroll();
      header.classList.toggle('is-solid', y > 40);
      if (header.classList.contains('is-menu')) return;
      header.classList.toggle('is-hidden', self.direction === 1 && y > 240);
    },
  });

  let darkCount = 0;
  document.querySelectorAll<HTMLElement>('[data-theme="dark"]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 36px',
      end: 'bottom 36px',
      onToggle: (self) => {
        darkCount += self.isActive ? 1 : -1;
        header.classList.toggle('is-dark', darkCount > 0);
      },
    });
  });
}
