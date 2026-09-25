import { silenceLive } from './live-video';

/**
 * Видеоплееры сайта:
 * — нажатие на карточку запускает видео со звуком, повторное — пауза;
 * — одновременно играет только одно видео;
 * — полоска прогресса и кнопка звука;
 * — видео, ушедшее за экран, ставится на паузу.
 */
export function initPlayers() {
  const players = Array.from(document.querySelectorAll<HTMLElement>('[data-player]'));

  const stopOthers = (current: HTMLElement) => {
    players.forEach((p) => {
      if (p === current) return;
      const v = p.querySelector<HTMLVideoElement>('[data-player-video]');
      if (v && !v.paused) v.pause();
      p.classList.remove('is-preview');
    });
    silenceLive();
  };

  players.forEach((box) => {
    const video = box.querySelector<HTMLVideoElement>('[data-player-video]');
    const toggle = box.querySelector<HTMLButtonElement>('[data-player-toggle]');
    const mute = box.querySelector<HTMLButtonElement>('[data-player-mute]');
    const bar = box.querySelector<HTMLElement>('[data-player-progress]');
    if (!video || !toggle) return;

    const title = toggle.getAttribute('aria-label')?.replace(/^Смотреть: /, '') ?? '';

    toggle.addEventListener('click', () => {
      // Шёл тихий предпросмотр — включаем ролик со звуком с начала
      if (box.classList.contains('is-preview')) {
        box.classList.remove('is-preview', 'is-muted');
        stopOthers(box);
        video.loop = false;
        video.currentTime = 0;
        video.muted = false;
        video.play().catch(() => {
          video.muted = true;
          box.classList.add('is-muted');
        });
        return;
      }
      if (video.paused) {
        stopOthers(box);
        video.muted = false;
        video.play().catch(() => {
          // Браузер запретил звук — запускаем без звука
          video.muted = true;
          box.classList.add('is-muted');
          video.play().catch(() => {});
        });
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      box.classList.add('is-playing');
      if (!box.classList.contains('is-preview')) box.classList.add('is-started');
      toggle.setAttribute('aria-label', `Пауза: ${title}`);
    });
    video.addEventListener('pause', () => {
      box.classList.remove('is-playing');
      toggle.setAttribute('aria-label', `Смотреть: ${title}`);
    });
    video.addEventListener('ended', () => {
      box.classList.remove('is-playing', 'is-started');
      video.currentTime = 0;
    });
    video.addEventListener('timeupdate', () => {
      if (bar && video.duration) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
    });

    mute?.addEventListener('click', () => {
      video.muted = !video.muted;
      box.classList.toggle('is-muted', video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
    });

    // Прокрутили дальше — ставим на паузу
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.2 },
    ).observe(box);
  });
}

/** Тихий предпросмотр: ролик играет без звука по кругу (для активной карточки карусели) */
export function previewPlayer(box: HTMLElement) {
  const video = box.querySelector<HTMLVideoElement>('[data-player-video]');
  if (!video || box.classList.contains('is-started')) return;
  video.muted = true;
  video.loop = true;
  box.classList.add('is-preview');
  video.play().catch(() => box.classList.remove('is-preview'));
}

/** Остановить ролик и вернуть карточку в исходный вид */
export function stopPlayer(box: HTMLElement) {
  const video = box.querySelector<HTMLVideoElement>('[data-player-video]');
  if (!video) return;
  video.pause();
  video.loop = false;
  box.classList.remove('is-preview', 'is-started', 'is-playing');
}
