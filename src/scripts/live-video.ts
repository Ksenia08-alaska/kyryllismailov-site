/**
 * Все видео «как в Reels» (первый экран и блок Кирилла):
 * — играют без звука, пока видны на экране, и встают на паузу за экраном;
 * — «Включить звук»: первый раз — со звуком с начала, дальше — вкл/выкл;
 * — нажатие по видео — пауза / продолжить;
 * — полосу можно тянуть, стрелки ← → перематывают на 5 секунд;
 * — со звуком одновременно играет только одно видео на сайте.
 */
const fmt = (t: number) => {
  const s = Math.max(0, Math.floor(t || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Заглушить все видео со звуком, кроме указанного (вызывают и обычные плееры) */
export function silenceLive(except?: HTMLVideoElement | null) {
  document.querySelectorAll<HTMLElement>('[data-live]').forEach((box) => {
    const v = box.querySelector<HTMLVideoElement>('[data-live-video]');
    if (!v || v === except || v.muted) return;
    v.muted = true;
    box.classList.remove('is-sound');
  });
}

export function initLiveVideos() {
  document.querySelectorAll<HTMLElement>('[data-live]').forEach((box) => {
    const video = box.querySelector<HTMLVideoElement>('[data-live-video]');
    const tap = box.querySelector<HTMLButtonElement>('[data-live-tap]');
    const sound = box.querySelector<HTMLButtonElement>('[data-live-sound]');
    const seek = box.querySelector<HTMLElement>('[data-live-seek]');
    const fill = box.querySelector<HTMLElement>('[data-live-fill]');
    const flash = box.querySelector<HTMLElement>('[data-live-flash]');
    if (!video || !tap || !sound || !seek || !fill) return;

    // Выбор файла: телефон или экономия трафика — лёгкая версия, иначе полная
    const mobileSrc = video.dataset.srcMobile;
    if (mobileSrc && !video.getAttribute('src')) {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const small = window.matchMedia('(max-width: 900px)').matches || !!conn?.saveData;
      video.src = small ? mobileSrc : video.dataset.src ?? mobileSrc;
    }

    let userPaused = false;
    let soundUnlocked = false;
    let compactTimer = 0;

    const render = () => {
      const d = video.duration || 0;
      const p = d ? video.currentTime / d : 0;
      fill.style.width = `calc((100% - 32px) * ${p})`;
      seek.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      seek.setAttribute('aria-valuetext', `${fmt(video.currentTime)} из ${fmt(d)}`);
    };
    const tryPlay = () => video.play().catch(() => box.classList.add('is-paused'));

    video.addEventListener('play', () => {
      box.classList.remove('is-paused');
      tap.setAttribute('aria-label', 'Пауза');
    });
    video.addEventListener('pause', () => {
      box.classList.add('is-paused');
      tap.setAttribute('aria-label', 'Продолжить видео');
    });
    video.addEventListener('timeupdate', render);
    video.addEventListener('loadedmetadata', render);

    tap.addEventListener('click', () => {
      if (video.paused) {
        userPaused = false;
        video.play().catch(() => {});
      } else {
        userPaused = true;
        video.pause();
        flash?.animate([{ opacity: 0.9 }, { opacity: 1 }], { duration: 200 });
      }
    });

    sound.addEventListener('click', () => {
      if (!soundUnlocked) {
        soundUnlocked = true;
        document.querySelectorAll<HTMLVideoElement>('[data-player-video]').forEach((v) => v.pause());
        silenceLive(video);
        video.currentTime = 0;
        video.muted = false;
        video.loop = false;
      } else {
        video.muted = !video.muted;
        if (!video.muted) silenceLive(video);
      }
      box.classList.toggle('is-sound', !video.muted);
      sound.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
      if (video.paused) {
        userPaused = false;
        video.play().catch(() => {});
      }
    });

    // Кто-то другой включил звук — эта кнопка возвращается в «без звука»
    video.addEventListener('volumechange', () => {
      box.classList.toggle('is-sound', !video.muted);
      sound.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
    });

    video.addEventListener('ended', () => {
      video.muted = true;
      video.loop = true;
      soundUnlocked = false;
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    // Перемотка
    const seekTo = (clientX: number) => {
      const r = seek.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (clientX - r.left - 16) / (r.width - 32)));
      if (video.duration) video.currentTime = k * video.duration;
      render();
    };
    seek.addEventListener('pointerdown', (e) => {
      seek.setPointerCapture(e.pointerId);
      seek.classList.add('is-drag');
      seekTo(e.clientX);
    });
    seek.addEventListener('pointermove', (e) => {
      if (seek.classList.contains('is-drag')) seekTo(e.clientX);
    });
    const endDrag = () => seek.classList.remove('is-drag');
    seek.addEventListener('pointerup', endDrag);
    seek.addEventListener('pointercancel', endDrag);
    seek.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
      render();
    });

    // Играем только на экране; подпись у кнопки звука сворачивается через 4,5 с после первого показа
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPaused) tryPlay();
          if (!compactTimer) compactTimer = window.setTimeout(() => box.classList.add('is-compact'), 4500);
        } else if (!video.paused) {
          video.pause();
          userPaused = false;
        }
      },
      { threshold: 0.3 },
    ).observe(box);
  });
}
