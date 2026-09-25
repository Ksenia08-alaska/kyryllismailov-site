import { gsap } from 'gsap';

/**
 * Секция тем.
 * Компьютер: секция закрепляется, карточки едут горизонтально вслед за скроллом.
 * Телефон: обычная лента, которую листают пальцем, — ничего не закрепляется
 * и нижняя кнопка связи не перекрывает карточки.
 * Полоски групп заполняются пропорционально (10/15/15/10).
 */
export function initTopics(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('[data-topics]');
  const viewport = document.querySelector<HTMLElement>('[data-topics-viewport]');
  const track = document.querySelector<HTMLElement>('[data-topics-track]');
  const num = document.querySelector<HTMLElement>('[data-topics-num]');
  const group = document.querySelector<HTMLElement>('[data-topics-group]');
  const reels = gsap.utils.toArray<HTMLElement>('[data-reel]');
  const segs = gsap.utils.toArray<HTMLElement>('[data-seg]');
  if (!section || !viewport || !track || !reels.length) return;

  const values = reels.map((r) => Number(r.dataset.n));

  const setSegments = (n: number) => {
    for (const s of segs) {
      const from = Number(s.dataset.from);
      const to = Number(s.dataset.to);
      const k = gsap.utils.clamp(0, 1, (n - from + 1) / (to - from + 1));
      gsap.set(s, { scaleX: k });
    }
  };

  if (reduced) {
    setSegments(values[values.length - 1]);
    return;
  }

  const mm = gsap.matchMedia();

  // ── Телефон и планшет: лента с пальцевой прокруткой ──
  mm.add('(max-width: 999px)', () => {
    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const pos = max > 0 ? (viewport.scrollLeft / max) * (values.length - 1) : 0;
      const i = Math.min(values.length - 1, Math.floor(pos));
      const next = values[Math.min(values.length - 1, i + 1)];
      setSegments(values[i] + (next - values[i]) * (pos - i));
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener('scroll', onScroll);
  });

  // ── Компьютер: закреплённая секция ──
  mm.add('(min-width: 1000px)', () => {
  // Карточки обрезаются только слева, справа уходят за край экрана
  viewport.style.clipPath = 'inset(-60px -100vw -60px 0)';

  const distance = () => {
    const left = viewport.getBoundingClientRect().left;
    const padRight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || 24;
    return Math.max(0, track.scrollWidth - (window.innerWidth - left) + padRight + 20);
  };

  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    const r = reels[i];
    if (num) {
      gsap.fromTo(
        num,
        { yPercent: 30, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out', overwrite: true },
      );
      num.textContent = r.dataset.n ?? '';
    }
    if (group) group.textContent = r.dataset.group ?? '';
  };

  const screens = reels.map((r) => r.querySelector<HTMLElement>('.reel__screen')!);
  const skewTo = screens.map((s) => gsap.quickTo(s, 'skewX', { duration: 0.5, ease: 'power3.out' }));

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: 'top top',
      end: () => '+=' + distance(),
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const pos = self.progress * (values.length - 1);
        const i = Math.min(values.length - 1, Math.floor(pos));
        const f = pos - i;
        const next = values[Math.min(values.length - 1, i + 1)];
        setSegments(values[i] + (next - values[i]) * f);
        setActive(Math.round(pos));

        const skew = gsap.utils.clamp(-4, 4, self.getVelocity() / -450);
        skewTo.forEach((fn) => fn(skew));
      },
      onLeave: () => skewTo.forEach((fn) => fn(0)),
      onLeaveBack: () => skewTo.forEach((fn) => fn(0)),
    },
  });

  setActive(0);
  setSegments(values[0]);

  return () => {
    viewport.style.clipPath = '';
  };
  });
}
