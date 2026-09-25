import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Шаги загораются по мере скролла, линия между ними заполняется. */
export function initProcess() {
  const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
  steps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      end: 'bottom 62%',
      onToggle: (self) => {
        if (self.isActive || self.progress === 1) step.classList.add('is-active');
      },
      onLeaveBack: () => step.classList.remove('is-active'),
      onUpdate: (self) => step.style.setProperty('--fill', String(self.progress)),
    });
  });
}
