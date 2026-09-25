import { gsap } from 'gsap';
import { previewPlayer, stopPlayer } from './player';

/**
 * 3D-карусель примеров:
 * — активная карточка в центре, соседние по бокам с поворотом;
 * — стрелки, точки, свайп пальцем, перетаскивание мышью, клавиши ← →;
 * — клик по боковой карточке делает её активной;
 * — активный ролик тихо проигрывается, пока блок на экране; нажатие — со звуком.
 */
export function initExamples(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-cf]');
  const stage = document.querySelector<HTMLElement>('[data-cf-stage]');
  const items = gsap.utils.toArray<HTMLElement>('[data-cf-item]');
  if (!root || !stage || !items.length) return;

  document.documentElement.classList.add('cf-ready');
  const n = items.length;
  const current = document.querySelector<HTMLElement>('[data-cf-current]');
  const dots = gsap.utils.toArray<HTMLElement>('[data-cf-dot]');
  let active = 0;
  let inView = false;

  const playerOf = (i: number) => items[i].querySelector<HTMLElement>('[data-player]');

  const layout = (instant = false) => {
    const w = items[0].offsetWidth;
    const mobile = window.innerWidth < 1000;
    const step = w * (mobile ? 0.66 : 0.78);
    items.forEach((el, i) => {
      // Кратчайшее расстояние по кругу: -2 … 2
      let d = i - active;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const a = Math.abs(d);
      gsap.to(el, {
        x: d * step,
        z: -a * 140,
        rotationY: -d * (mobile ? 22 : 16),
        scale: 1 - a * 0.08,
        autoAlpha: a > 2 ? 0 : 1,
        zIndex: 10 - a,
        duration: instant || reduced ? 0 : 0.9,
        ease: 'expo.out',
      });
      el.classList.toggle('is-active', d === 0);
      el.setAttribute('aria-hidden', String(d !== 0));
      el.querySelectorAll('button').forEach((b) => (b.tabIndex = d === 0 ? 0 : -1));
    });
    if (current) current.textContent = String(active + 1).padStart(2, '0');
    dots.forEach((dot, i) => dot.classList.toggle('is-on', i === active));
  };

  const go = (i: number) => {
    const prev = playerOf(active);
    if (prev) stopPlayer(prev);
    active = (i + n) % n;
    layout();
    const p = playerOf(active);
    if (p && inView && !reduced) gsap.delayedCall(0.35, () => previewPlayer(p));
  };

  document.querySelector('[data-cf-prev]')?.addEventListener('click', () => go(active - 1));
  document.querySelector('[data-cf-next]')?.addEventListener('click', () => go(active + 1));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  });

  // Клик по боковой карточке — сначала сделать её активной, а не запускать
  let dragged = false;
  items.forEach((el, i) => {
    el.addEventListener(
      'click',
      (e) => {
        if (dragged || i !== active) {
          e.preventDefault();
          e.stopPropagation();
          if (!dragged) go(i);
        }
      },
      true,
    );
  });

  // Свайп и перетаскивание
  let startX = 0;
  let startY = 0;
  let down = false;
  stage.addEventListener('pointerdown', (e) => {
    down = true;
    dragged = false;
    startX = e.clientX;
    startY = e.clientY;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    if (Math.abs(e.clientX - startX) > 12 && Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY)) dragged = true;
  });
  window.addEventListener('pointerup', (e) => {
    if (!down) return;
    down = false;
    const dx = e.clientX - startX;
    if (dragged && Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    setTimeout(() => (dragged = false), 0);
  });

  window.addEventListener('resize', () => layout(true));
  layout(true);

  // Предпросмотр активного ролика, только пока карусель на экране
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      const p = playerOf(active);
      if (!p || reduced) return;
      if (inView) previewPlayer(p);
      else if (p.classList.contains('is-preview')) stopPlayer(p);
    },
    { threshold: 0.45 },
  ).observe(stage);
}
