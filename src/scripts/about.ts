import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

/**
 * Блок «Кто снимает»:
 * — фото-карточки можно двигать мышью (на телефоне — нет, чтобы не мешать скроллу);
 * — при появлении карточки «раскладываются» веером;
 * — видео Кирилла всплывает при прокрутке.
 */
export function initAbout(reduced: boolean) {
  const photos = gsap.utils.toArray<HTMLElement>('[data-photo]');
  const wrap = document.querySelector<HTMLElement>('[data-photos]');

  if (!reduced && photos.length && wrap) {
    gsap.from(photos, {
      y: 120,
      rotation: (i: number) => (i % 2 ? 18 : -18),
      autoAlpha: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: wrap, start: 'top 80%', toggleActions: 'play none none reverse' },
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      gsap.registerPlugin(Draggable);
      let z = 10;
      photos.forEach((el) => {
        Draggable.create(el, {
          bounds: wrap.closest('section') ?? wrap,
          onPress() {
            gsap.set(el, { zIndex: ++z });
            gsap.to(el, { scale: 1.05, duration: 0.3 });
          },
          onRelease() {
            gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
          },
        });
      });
    }
  }

  // Видео Кирилла мягко «всплывает» при прокрутке
  const featured = document.querySelector<HTMLElement>('[data-about-video]');
  if (!reduced && featured) {
    gsap.fromTo(
      featured,
      { y: 80, rotation: 4 },
      {
        y: 0,
        rotation: 0,
        ease: 'none',
        scrollTrigger: { trigger: featured, start: 'top bottom', end: 'center center', scrub: 0.6 },
      },
    );
  }
}
