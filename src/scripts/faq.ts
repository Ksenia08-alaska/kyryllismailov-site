import { gsap } from 'gsap';

/** Аккордеон вопросов с плавным раскрытием. Работает с клавиатуры. */
export function initFaq(reduced: boolean) {
  document.querySelectorAll<HTMLElement>('[data-faq]').forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('[data-faq-btn]')!;
    const panel = item.querySelector<HTMLElement>('[data-faq-panel]')!;
    // В разметке ответы открыты (для поисковиков и без JS) — прячем их до клика
    panel.hidden = true;
    panel.classList.add('is-ready');

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));

      if (reduced) {
        panel.hidden = open;
        return;
      }
      if (open) {
        gsap.to(panel, {
          height: 0,
          duration: 0.5,
          ease: 'expo.inOut',
          onComplete: () => {
            panel.hidden = true;
            gsap.set(panel, { clearProps: 'height' });
          },
        });
      } else {
        panel.hidden = false;
        gsap.fromTo(
          panel,
          { height: 0 },
          {
            height: 'auto',
            duration: 0.6,
            ease: 'expo.out',
            onComplete: () => gsap.set(panel, { clearProps: 'height' }),
          },
        );
      }
    });
  });
}
