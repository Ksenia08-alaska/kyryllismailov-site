import { gsap } from 'gsap';
import type { LenisInstance } from './smooth-scroll';

/** Полноэкранное меню для телефона. Закрывается по Esc и по ссылке. */
export function initMenu(lenis: LenisInstance | null) {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const labelEl = document.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !menu || !header) return;

  const links = menu.querySelectorAll<HTMLElement>('[data-menu-link]');
  const bottom = menu.querySelector<HTMLElement>('[data-menu-bottom]');
  const html = document.documentElement;
  let open = false;

  const setOpen = (value: boolean) => {
    open = value;
    toggle.setAttribute('aria-expanded', String(value));
    if (labelEl) labelEl.textContent = value ? 'Закрыть меню' : 'Открыть меню';

    if (value) {
      menu.hidden = false;
      header.classList.add('is-menu');
      header.classList.remove('is-hidden');
      // Страница под меню не прокручивается, нижняя кнопка связи прячется
      html.classList.add('menu-open');
      html.style.overflow = 'hidden';
      lenis?.stop();
      gsap
        .timeline()
        .fromTo(
          menu,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' },
        )
        .fromTo(
          links,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
          '-=0.4',
        )
        .fromTo(bottom, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' }, '-=0.6');
      menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    } else {
      html.classList.remove('menu-open');
      html.style.overflow = '';
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
