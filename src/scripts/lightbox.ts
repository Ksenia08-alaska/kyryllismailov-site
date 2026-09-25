/** Скриншоты статистики во весь экран. Esc, крестик или клик по фону закрывают. */
export function initLightbox() {
  const root = document.querySelector<HTMLElement>('[data-lightbox-root]');
  const img = document.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const caption = document.querySelector<HTMLElement>('[data-lightbox-caption]');
  const close = document.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  if (!root || !img || !caption || !close) return;

  let opener: HTMLElement | null = null;
  const hide = () => {
    root.hidden = true;
    document.documentElement.style.overflow = '';
    opener?.focus();
  };

  document.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      opener = btn;
      img.src = btn.dataset.lightbox ?? '';
      img.alt = btn.dataset.lightboxAlt ?? '';
      caption.textContent = btn.dataset.lightboxAlt ?? '';
      root.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      close.focus();
    });
  });
  close.addEventListener('click', hide);
  root.addEventListener('click', (e) => {
    if (e.target === root) hide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !root.hidden) hide();
  });
}
