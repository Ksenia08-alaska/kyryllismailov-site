import { gsap } from 'gsap';
import type { LenisInstance } from './smooth-scroll';

/** Полноэкранное меню для телефона. Закрывается по Esc и по ссылке. */
export function initMenu(lenis: LenisInstance | null) {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const labelEl = document.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !menu || !header) return;

  const texts = menu.querySelectorAll<HTMLElement>('.menu__text');
  let open = false;

  const setOpen = (value: boolean) => {
    open = value;
    toggle.setAttribute('aria-expanded', String(value));
    if (labelEl) labelEl.textContent = value ? 'Закрыть меню' : 'Открыть меню';

    if (value) {
      menu.hidden = false;
      header.classList.add('is-menu');
      header.classList.remove('is-hidden');
      lenis?.stop();
      gsap
        .timeline()
        .fromTo(
          menu,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' },
        )
        .fromTo(
          texts,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 },
          '-=0.35',
        );
      menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      gsap.to(menu, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.7,
        ease: 'expo.inOut',
        onComplete: () => {
          menu.hidden = true;
          header.classList.remove('is-menu');
        },
      });
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));
  menu.querySelectorAll('[data-menu-link]').forEach((link) =>
    link.addEventListener('click', () => setOpen(false)),
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
    if (e.matches && open) setOpen(false);
  });
}
