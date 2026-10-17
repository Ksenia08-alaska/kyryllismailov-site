import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { track } from '@vercel/analytics';
import type { LenisInstance } from './smooth-scroll';

/**
 * Фильтр «Какой у вас бизнес?».
 * Кнопки с data-seg-pick (на первом экране, в фильтре раздела «Для кого», «Подробнее»)
 * выбирают тип бизнеса. Выбор:
 *  - ставит <html data-seg="food|hotel|other">;
 *  - в разделе «Для кого» подсвечивает свой раздел и сворачивает остальные;
 *  - по всему сайту подсвечивает элементы с data-for, где есть этот тип (услуги, цены),
 *    а остальные слегка приглушает.
 * Выбор запоминается в браузере, «Показать все» сбрасывает его.
 */
const KEY = 'kyr-seg';

export function initFilter(lenis: LenisInstance | null, reduced: boolean) {
  const root = document.documentElement;
  const picks = Array.from(document.querySelectorAll<HTMLElement>('[data-seg-pick]'));
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-seg-block]'));
  const tagged = Array.from(document.querySelectorAll<HTMLElement>('[data-for]'));
  if (!picks.length) return;
  const ids = new Set(blocks.map((b) => b.dataset.segBlock));

  const scrollToBlock = (id: string) => {
    const el = document.getElementById(`seg-${id}`);
    if (!el) return;
    // Отступ сверху: шапка сайта + закреплённый фильтр (на телефоне фильтр не закреплён)
    const offset = -(window.innerWidth < 641 ? 90 : 160);
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced ? 'auto' : 'smooth' });
  };

  const apply = (seg: string, animate: boolean) => {
    if (seg) root.dataset.seg = seg;
    else delete root.dataset.seg;

    picks.forEach((p) => p.setAttribute('aria-pressed', String((p.dataset.segPick ?? '') === seg)));

    blocks.forEach((b) => {
      const match = !!seg && b.dataset.segBlock === seg;
      const wasDim = b.classList.contains('is-dim');
      b.classList.toggle('is-match', match);
      b.classList.toggle('is-dim', !!seg && !match);
      // Раздел, который только что раскрылся, плавно проявляется
      if (animate && !reduced && wasDim && !b.classList.contains('is-dim')) {
        const body = b.querySelector('.segb__body');
        if (body) gsap.fromTo(body, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      }
    });

    tagged.forEach((el) => {
      const list = (el.dataset.for ?? '').split(/\s+/);
      const match = !!seg && list.includes(seg);
      el.classList.toggle('is-match', match);
      el.classList.toggle('is-dim', !!seg && !match);
    });

    try {
      if (seg) localStorage.setItem(KEY, seg);
      else localStorage.removeItem(KEY);
    } catch {
      /* хранилище недоступно — просто не запоминаем */
    }
    // Высота страницы изменилась — пересчитываем анимации по скроллу
    ScrollTrigger.refresh();
  };

  picks.forEach((p) =>
    p.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // чтобы общий обработчик якорей не прокрутил страницу сам
      const seg = p.dataset.segPick ?? '';
      apply(seg, true);
      if (seg) {
        scrollToBlock(seg);
        try {
          track('Выбор бизнеса', { type: seg });
        } catch {
          /* аналитика не критична */
        }
      }
    }),
  );

  // Восстанавливаем прошлый выбор без прокрутки
  let saved = '';
  try {
    saved = localStorage.getItem(KEY) ?? '';
  } catch {
    saved = '';
  }
  if (saved && ids.has(saved)) apply(saved, false);
}
