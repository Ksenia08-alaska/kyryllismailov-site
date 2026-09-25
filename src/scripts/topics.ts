import { gsap } from 'gsap';

/**
 * Секция тем: закрепляется, карточки едут горизонтально вслед за скроллом
 * (и на компьютере, и на телефоне). Пока секция закреплена, нижняя кнопка связи
 * на телефоне прячется, чтобы не закрывать карточки.
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
      onToggle: (self) => document.documentElement.classList.toggle('topics-pinned', self.isActive),
      onLeave: () => skewTo.forEach((fn) => fn(0)),
      onLeaveBack: () => skewTo.forEach((fn) => fn(0)),
    },
  });

  setActive(0);
  setSegments(values[0]);
}
