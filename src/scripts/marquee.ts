import { gsap } from 'gsap';
import type { LenisInstance } from './smooth-scroll';

/** Бегущая строка: ускоряется от скорости скролла и меняет направление. */
export function initMarquee(lenis: LenisInstance | null) {
  const track = document.querySelector<HTMLElement>('[data-marquee-track]');
  if (!track) return;

  const tween = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  // Сдвигаем «время» далеко вперёд, чтобы можно было крутить назад
  tween.totalTime(tween.duration() * 500);

  if (!lenis) return;

  let dir = 1;
  let velocity = 0;
  let current = 1;

  lenis.on('scroll', (e: { velocity: number; direction: number }) => {
    if (e.direction) dir = e.direction;
    velocity = e.velocity;
  });

  gsap.ticker.add(() => {
    const target = dir * (1 + Math.min(Math.abs(velocity) * 0.22, 7));
    velocity *= 0.9;
    current += (target - current) * 0.08;
    tween.timeScale(current);
  });
}
