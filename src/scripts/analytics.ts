import { track } from '@vercel/analytics';

/**
 * События для Vercel Analytics: какие кнопки связи нажимают и откуда.
 * Личных данных не собирается — только название действия и блок сайта.
 * (Просмотры страниц считаются автоматически; собственные события доступны на тарифе Vercel Pro.)
 */
const placeOf = (el: Element) => {
  if (el.closest('[data-header]')) return 'шапка';
  if (el.closest('[data-sticky-cta]')) return 'нижняя кнопка на телефоне';
  if (el.closest('[data-menu]')) return 'меню';
  if (el.closest('footer')) return 'футер';
  const section = el.closest('section[id]');
  const names: Record<string, string> = {
    top: 'первый экран',
    about: 'Кирилл',
    examples: 'примеры',
    stats: 'статистика',
    package: 'что входит',
    pricing: 'цена',
    faq: 'вопросы',
    contact: 'связь',
  };
  return section ? (names[section.id] ?? section.id) : 'другое';
};

export function initAnalytics() {
  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (link) {
        const href = link.href;
        let action = '';
        if (href.includes('t.me/')) action = 'Telegram менеджера';
        else if (href.includes('blog._.manager')) action = 'Instagram менеджера';
        else if (href.includes('instagram.com/kyryllismailov')) action = 'Блог Кирилла';
        if (action) track('Клик', { action, place: placeOf(link) });
        return;
      }
      const sound = (e.target as Element | null)?.closest('[data-live-sound]');
      if (sound && sound.getAttribute('aria-label') === 'Включить звук') {
        track('Видео со звуком', { place: placeOf(sound) });
      }
    },
    true,
  );
}
