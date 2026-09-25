import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/**
 * Общие появления по всему сайту. Срабатывают каждый раз:
 * прокрутили вниз — появились, вернулись выше блока — спрятались и появятся снова.
 */
export function initReveals() {
  // Лаймовый маркер прорисовывается под фразой каждый раз, когда её блок появляется на экране.
  // Следим за самим заголовком/абзацем: анимация текста пересобирает слова внутри, а блок остаётся.
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('hl-on', e.isIntersecting)),
    { rootMargin: '0px 0px -15% 0px' },
  );
  const hosts = new Set<Element>();
  document.querySelectorAll('mark.hl').forEach((m) => {
    const host = m.closest('h1, h2, h3, p, li');
    if (host) hosts.add(host);
  });
  hosts.forEach((h) => io.observe(h));

  // Заголовки секций поднимаются по строкам из-под «маски»
  document.querySelectorAll<HTMLElement>('.section-title').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      },
    });
  });

  // Карточки «Что вы получаете» выезжают снизу с небольшим поворотом
  const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
  if (cards.length) {
    gsap.from(cards, {
      y: 80,
      rotation: (i: number) => (i - 1) * 3,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: cards[0], start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  }
}
