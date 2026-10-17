import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { LenisInstance } from './smooth-scroll';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Прелоадер считает 00 → число роликов в пакете, затем уезжает вверх,
 * заголовок поднимается по словам, телефон «выезжает» снизу.
 */
export function runIntro(lenis: LenisInstance | null): Promise<void> {
  const pre = document.querySelector<HTMLElement>('[data-preloader]');
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  const fades = gsap.utils.toArray<HTMLElement>('[data-hero-fade]');
  const phone = document.querySelector<HTMLElement>('[data-phone]');
  if (!title) return Promise.resolve();

  const showPre = !!pre && getComputedStyle(pre).display !== 'none';
  lenis?.stop();
  window.scrollTo(0, 0);

  const split = SplitText.create(title, { type: 'lines,words', mask: 'lines' });
  gsap.set(title, { visibility: 'visible' });
  gsap.set(split.words, { yPercent: 115 });
  gsap.set(fades, { autoAlpha: 0, y: 24 });
  if (phone) gsap.set(phone, { y: 140, rotation: 8, autoAlpha: 0 });
  const sticker = document.querySelector<HTMLElement>('[data-sticker]');
  if (sticker) gsap.set(sticker, { scale: 0, rotation: -120, autoAlpha: 0 });
  const swoosh = document.querySelector<SVGPathElement>('[data-swoosh]');
  const swooshLen = swoosh ? swoosh.getTotalLength() : 0;
  if (swoosh) gsap.set(swoosh, { strokeDasharray: swooshLen, strokeDashoffset: swooshLen });

  const tl = gsap.timeline();

  if (showPre && pre) {
    const num = pre.querySelector<HTMLElement>('[data-preloader-num]');
    const bar = pre.querySelector<HTMLElement>('[data-preloader-bar]');
    const counter = { v: 0 };
    gsap.set(pre, { clipPath: 'inset(0% 0% 0% 0%)' });

    tl.to(counter, {
      v: Number(pre.dataset.reels) || 25,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (num) num.textContent = pad(Math.round(counter.v));
      },
    })
      .to(bar, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
      .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '+=0.12')
      .set(pre, { display: 'none' });

    try {
      sessionStorage.setItem('kyr-seen', '1');
    } catch {
      /* приватный режим */
    }
  } else if (pre) {
    pre.style.display = 'none';
  }

  tl.to(
    split.words,
    { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 },
    showPre ? '-=0.5' : 0.1,
  )
    .to(
      phone,
      { y: 0, rotation: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out' },
      '<0.15',
    )
    .to(fades, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, '<0.25');
  // Росчерк под ценой есть не во всех версиях первого экрана
  if (swoosh) tl.to(swoosh, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '<0.35');
  if (sticker) {
    tl.to(sticker, { scale: 1, rotation: 0, autoAlpha: 1, duration: 1, ease: 'back.out(1.8)' }, swoosh ? '<0.1' : '<0.45');
  }

  return new Promise((resolve) => {
    tl.eventCallback('onComplete', () => {
      split.revert();
      gsap.set(title, { visibility: 'visible' });
      lenis?.start();
      resolve();
    });
  });
}
