import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Нижняя кнопка на телефоне: видна после первого экрана, скрыта в блоке связи. */
export function initStickyCta() {
  const bar = document.querySelector<HTMLElement>('[data-sticky-cta]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const contact = document.getElementById('contact');
  if (!bar || !hero) return;

  let pastHero = false;
  let inContact = false;
  const update = () => bar.classList.toggle('is-visible', pastHero && !inContact);

  // onEnter / onLeaveBack надёжнее isActive: срабатывают и в самом конце страницы
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 60%',
    onEnter: () => {
      pastHero = true;
      update();
    },
    onLeaveBack: () => {
      pastHero = false;
      update();
    },
  });
  if (contact) {
    ScrollTrigger.create({
      trigger: contact,
      start: 'top 85%',
      onEnter: () => {
        inContact = true;
        update();
      },
      onLeaveBack: () => {
        inContact = false;
        update();
      },
    });
  }
}
