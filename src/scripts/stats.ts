import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const fmt = (v: number, d: number) =>
  v
    .toFixed(d)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

/**
 * Цифры статистики:
 * — главная цифра считается прямо вместе со скроллом (вниз растёт, вверх убывает);
 * — остальные накручиваются каждый раз, когда блок появляется на экране — сверху или снизу.
 */
export function initStats() {
  document.querySelectorAll<HTMLElement>('[data-count-scrub]').forEach((el) => {
    const target = Number(el.dataset.countScrub);
    const decimals = Number(el.dataset.decimals ?? 0);
    const ease = gsap.parseEase('power2.out');
    el.textContent = fmt(0, decimals);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      end: 'top 30%',
      scrub: true,
      onUpdate: (self) => {
        el.textContent = fmt(target * ease(self.progress), decimals);
      },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const state = { v: 0 };
    el.textContent = fmt(0, decimals);

    const run = () => {
      state.v = 0;
      gsap.to(state, {
        v: target,
        duration: 1.8,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: () => {
          el.textContent = fmt(state.v, decimals);
        },
      });
    };
    const reset = () => {
      gsap.killTweensOf(state);
      state.v = 0;
      el.textContent = fmt(0, decimals);
    };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      end: 'bottom top',
      onEnter: run,
      onEnterBack: run,
      onLeave: reset,
      onLeaveBack: reset,
    });
  });
}

/** Полоски аудитории вырастают каждый раз, когда карточка появляется на экране. */
export function initAudience() {
  document.querySelectorAll<HTMLElement>('[data-aud]').forEach((card) => {
    const fills = card.querySelectorAll('[data-aud-fill]');
    gsap.fromTo(
      fills,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: card, start: 'top 88%', end: 'bottom top', toggleActions: 'play reset play reset' },
      },
    );
  });
}

/**
 * Вкладки над телефоном со скриншотами.
 * Пока человек их не трогает — скриншоты сами сменяются каждые 4 секунды.
 * Наведение мышью или фокус — пауза. Нажал на вкладку — автосмена выключается, дальше он листает сам.
 */
export function initProof(reduced = false) {
  const root = document.querySelector<HTMLElement>('[data-proof]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-proof-tab]'));
  const shots = Array.from(root.querySelectorAll<HTMLElement>('[data-proof-shot]'));
  const INTERVAL = 4000;
  root.style.setProperty('--proof-time', `${INTERVAL}ms`);

  let current = 0;
  let timer = 0;
  let auto = !reduced;
  let hovered = false;
  let inView = false;

  const show = (i: number) => {
    current = i;
    tabs.forEach((t, k) => {
      t.classList.toggle('is-on', k === i);
      t.setAttribute('aria-selected', String(k === i));
    });
    shots.forEach((s, k) => {
      s.classList.toggle('is-on', k === i);
      if (s.tagName === 'BUTTON') (s as HTMLButtonElement).tabIndex = k === i ? 0 : -1;
    });
  };

  const stop = () => {
    clearTimeout(timer);
    root.classList.remove('is-auto');
  };
  const schedule = () => {
    stop();
    if (!auto || hovered || !inView) return;
    // Перезапуск полоски-таймера под вкладкой
    void root.offsetWidth;
    root.classList.add('is-auto');
    timer = window.setTimeout(() => {
      show((current + 1) % tabs.length);
      schedule();
    }, INTERVAL);
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      auto = false; // человек выбрал сам — больше не переключаем за него
      stop();
      show(i);
    });
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : -1;
      if (next < 0) return;
      auto = false;
      stop();
      tabs[next].focus();
      show(next);
    });
  });

  root.addEventListener('pointerenter', (e) => {
    if ((e as PointerEvent).pointerType !== 'mouse') return;
    hovered = true;
    stop();
  });
  root.addEventListener('pointerleave', () => {
    hovered = false;
    schedule();
  });
  root.addEventListener('focusin', () => {
    hovered = true;
    stop();
  });
  root.addEventListener('focusout', () => {
    hovered = false;
    schedule();
  });
  // Открыли скриншот во весь экран — тоже считаем, что человек сам смотрит
  shots.forEach((s) => s.addEventListener('click', () => {
    auto = false;
    stop();
  }));

  // Листаем только когда блок на экране
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else stop();
    },
    { threshold: 0.4 },
  ).observe(root);
}
