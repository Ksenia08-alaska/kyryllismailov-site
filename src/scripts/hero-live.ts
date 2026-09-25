import { gsap } from 'gsap';

/**
 * Первый экран «Эфир Reels»:
 * — пятна фона медленно плавают и тянутся к курсору;
 * — в телефоне идёт таймер записи и сменяются темы роликов;
 * — вокруг всплывают вопросы покупателей;
 * — при скролле телефон слегка поворачивается и уезжает.
 */
export function initHeroLive(reduced: boolean) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const stage = hero.querySelector<HTMLElement>('[data-stage]');
  const phone = hero.querySelector<HTMLElement>('[data-phone]');
  const blobsWrap = hero.querySelector<HTMLElement>('[data-blobs]');
  const blobs = gsap.utils.toArray<HTMLElement>('[data-blob]', hero);
  const bubbles = gsap.utils.toArray<HTMLElement>('[data-bubble]', hero);

  // Темы для телефона
  const dataEl = hero.querySelector('[data-phone-topics]');
  const topics: { n: string; g: string; q: string }[] = dataEl ? JSON.parse(dataEl.textContent || '[]') : [];
  const nEl = hero.querySelector<HTMLElement>('[data-phone-n]');
  const gEl = hero.querySelector<HTMLElement>('[data-phone-group]');
  const qEl = hero.querySelector<HTMLElement>('[data-phone-q]');
  const bars = gsap.utils.toArray<HTMLElement>('[data-phone-progress] i', hero);
  const recEl = hero.querySelector<HTMLElement>('[data-rec-time]');

  if (reduced) {
    stage?.classList.add('is-static');
    bars.forEach((b, i) => gsap.set(b, { scaleX: i === 0 ? 1 : 0 }));
    return;
  }

  // ── Таймер записи (настоящие секунды с момента открытия) ──
  const start = performance.now();
  gsap.ticker.add(() => {
    if (!recEl) return;
    const s = Math.floor((performance.now() - start) / 1000);
    const text = `${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    if (recEl.textContent !== text) recEl.textContent = text;
  });

  // ── Смена тем в телефоне, как истории: полоска заполняется, затем следующая тема ──
  const SHOW = 3.2;
  let index = 0;
  const showTopic = (i: number) => {
    const t = topics[i];
    if (!t || !qEl || !nEl || !gEl) return;
    bars.forEach((b, k) => {
      gsap.killTweensOf(b);
      gsap.set(b, { scaleX: k < i ? 1 : 0 });
    });
    gsap
      .timeline()
      .to([qEl, nEl.parentElement], { yPercent: -30, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .add(() => {
        qEl.textContent = t.q;
        nEl.textContent = t.n;
        gEl.textContent = t.g;
      })
      .fromTo(
        [nEl.parentElement, qEl],
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', stagger: 0.06 },
      );
    if (bars[i]) gsap.to(bars[i], { scaleX: 1, duration: SHOW, ease: 'none' });
  };
  const next = () => {
    index = (index + 1) % topics.length;
    showTopic(index);
    gsap.delayedCall(SHOW, next);
  };
  // В режиме видео тем в телефоне нет — цикл не запускаем
  if (qEl && topics.length) {
    if (bars[0]) gsap.to(bars[0], { scaleX: 1, duration: SHOW, ease: 'none' });
    gsap.delayedCall(SHOW, next);
  }

  // ── Вопросы-пузыри: у каждого свой цикл, вместе они идут волной ──
  // Пузыри по одному-два, чтобы вокруг телефона было спокойно
  const STEP = 2.2;
  const PERIOD = STEP * bubbles.length;
  bubbles.forEach((b, i) => {
    const tl = gsap.timeline({ repeat: -1, delay: 0.6 + i * STEP, repeatDelay: Math.max(0.5, PERIOD - 3.8) });
    tl.fromTo(
      b,
      { autoAlpha: 0, y: 24, scale: 0.85, rotation: i % 2 ? 4 : -4 },
      { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.2)' },
    )
      .to(b, { y: -10, duration: 2.5, ease: 'sine.inOut' }, 0.7)
      .to(b, { autoAlpha: 0, y: -26, scale: 0.95, duration: 0.6, ease: 'power2.in' }, 3.2);
  });

  // ── Пятна фона плавают сами по себе ──
  blobs.forEach((blob, i) => {
    gsap.to(blob, {
      xPercent: gsap.utils.random(-14, 14),
      yPercent: gsap.utils.random(-12, 12),
      scale: gsap.utils.random(0.9, 1.15),
      duration: gsap.utils.random(7, 11),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.8,
    });
  });

  // ── Мышь: пятна и телефон тянутся за курсором ──
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && blobsWrap && phone) {
    const bx = gsap.quickTo(blobsWrap, 'x', { duration: 1.6, ease: 'power3.out' });
    const by = gsap.quickTo(blobsWrap, 'y', { duration: 1.6, ease: 'power3.out' });
    const rx = gsap.quickTo(phone, 'rotationY', { duration: 1, ease: 'power3.out' });
    const ry = gsap.quickTo(phone, 'rotationX', { duration: 1, ease: 'power3.out' });
    gsap.set(phone, { transformPerspective: 1000 });
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      bx(nx * 80);
      by(ny * 60);
      rx(nx * 14);
      ry(-ny * 10);
    });
    hero.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  }

  // ── Скролл: телефон поворачивается и уезжает вверх, пузыри разлетаются ──
  if (stage && phone) {
    gsap.to(phone, {
      yPercent: -12,
      rotation: -5,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    gsap.to(stage, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }
}
