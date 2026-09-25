import { gsap } from 'gsap';

/**
 * Живой фон:
 * — контурные слова плывут вбок при прокрутке;
 * — парящие кадры поднимаются с разной скоростью и слегка поворачиваются;
 * — в тёмных секциях световое пятно следует за курсором.
 */
export function initDeco() {
  gsap.utils.toArray<HTMLElement>('[data-bgtext]').forEach((el) => {
    const dir = Number(el.dataset.dir ?? 1);
    gsap.fromTo(
      el,
      { xPercent: dir * 8 },
      {
        xPercent: -dir * 14,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      },
    );
  });

  gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el) => {
    const speed = Number(el.dataset.speed ?? 0.4);
    gsap.fromTo(
      el,
      { y: 160 * speed },
      {
        y: -260 * speed,
        rotation: speed > 0.5 ? 14 : -10,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    );
  });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('[data-spot-host]').forEach((host) => {
      const spot = host.querySelector<HTMLElement>('.spot');
      if (!spot) return;
      host.addEventListener('pointermove', (e) => {
        const r = host.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }
}
