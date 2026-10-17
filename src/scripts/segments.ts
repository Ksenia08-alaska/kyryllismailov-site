import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Вкладки «Для кого мы работаем»: кафе и рестораны / отели / другой бизнес.
 * Клик или стрелки ← → переключают вкладку. Без JS все вкладки видны списком.
 */
export function initSegments(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-segments]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-seg-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-seg-panel]'));
  if (!tabs.length) return;

  const select = (index: number, focus = false) => {
    tabs.forEach((t, i) => {
      const on = i === index;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
    if (focus) tabs[index].focus();

    const parts = panels[index].querySelectorAll('[data-seg-anim]');
    if (!reduced) {
      gsap.fromTo(
        parts,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: 0.08, overwrite: true },
      );
      gsap.fromTo(
        panels[index].querySelectorAll('.seg__bubble'),
        { y: 14, autoAlpha: 0, scale: 0.96 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.09, delay: 0.15, overwrite: true },
      );
    }
    // Высота блока изменилась — пересчитываем позиции анимаций ниже
    ScrollTrigger.refresh();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next, true);
    });
  });
}
