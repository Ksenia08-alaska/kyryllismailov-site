import { gsap } from 'gsap';

/** Курсор: точка + кольцо с подписью над карточками. Только для мыши. */
export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const html = document.documentElement;
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  const label = document.querySelector<HTMLElement>('[data-cursor-label]');
  if (!dot || !ring || !label) return;

  html.classList.add('has-cursor');
  gsap.set([dot, ring], { x: -100, y: -100 });

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });

  let lastX = -1;
  let lastY = -1;
  const updateState = (t: Element | null) => {
    const labelled = t?.closest<HTMLElement>('[data-cursor]') ?? null;
    const interactive = t?.closest('a, button') ?? null;
    html.classList.toggle('cursor-label', !!labelled);
    html.classList.toggle('cursor-hover', !labelled && !!interactive);
    if (labelled) label.textContent = labelled.dataset.cursor ?? '';
  };

  document.addEventListener('pointerover', (e) => updateState(e.target as Element));
  window.addEventListener('pointermove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });
  // Страница прокрутилась под неподвижной мышью — проверяем, что теперь под курсором
  let queued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (queued || lastX < 0) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        updateState(document.elementFromPoint(lastX, lastY));
      });
    },
    { passive: true },
  );

  window.addEventListener('pointerdown', () => html.classList.add('cursor-down'));
  window.addEventListener('pointerup', () => html.classList.remove('cursor-down'));
  document.addEventListener('pointerleave', () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 }));
}
