import { gsap } from 'gsap';

/** Кнопки, которые притягиваются к курсору. */
export function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength ?? '0.3');
    const label = el.querySelector<HTMLElement>('.btn__label, .contact__btn-label');
    const opts = { duration: 0.8, ease: 'elastic.out(1, 0.45)' };
    const xTo = gsap.quickTo(el, 'x', opts);
    const yTo = gsap.quickTo(el, 'y', opts);
    const lx = label ? gsap.quickTo(label, 'x', opts) : null;
    const ly = label ? gsap.quickTo(label, 'y', opts) : null;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      xTo(mx * strength);
      yTo(my * strength);
      lx?.(mx * strength * 0.4);
      ly?.(my * strength * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
      lx?.(0);
      ly?.(0);
    });
  });
}
