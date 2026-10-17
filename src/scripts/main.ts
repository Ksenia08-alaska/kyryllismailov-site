/**
 * Точка входа. Порядок важен:
 * 1) ждём шрифты (иначе разбивка текста на строки будет неверной),
 * 2) включаем плавный скролл и интерфейс,
 * 3) проигрываем интро, 4) включаем эффекты по скроллу.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { initSmoothScroll } from './smooth-scroll';
import { runIntro } from './intro';
import { initHeroLive } from './hero-live';
import { initMarquee } from './marquee';
import { initTopics } from './topics';
import { initCursor } from './cursor';
import { initMagnetic } from './magnetic';
import { initHeader } from './header';
import { initMenu } from './menu';
import { initShader } from './shader';
import { initFooter } from './footer';
import { initStats, initAudience, initProof } from './stats';
import { initPlayers } from './player';
import { initExamples } from './examples';
import { initLiveVideos } from './live-video';
import { initReveals } from './reveal';
import { initDeco } from './deco';
import { initAnalytics } from './analytics';
import { initCalc } from './calc';
import { initProcess } from './process';
import { initFaq } from './faq';
import { initAbout } from './about';
import { initLightbox } from './lightbox';
import { initStickyCta } from './sticky-cta';
import { initSegments } from './segments';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function start() {
  try {
    await document.fonts.ready;
  } catch {
    /* шрифты не критичны */
  }

  const lenis = reduced ? null : initSmoothScroll();

  initAnalytics();
  initMenu(lenis);
  initShader(reduced);
  initCalc(reduced);
  initFaq(reduced);
  initSegments(reduced);
  initLightbox();
  initProof(reduced);
  initPlayers();
  initLiveVideos();

  if (reduced) {
    initHeroLive(true);
    initAbout(true);
    initExamples(true);
    initTopics(true);
    initStickyCta();
    initHeader();
    return;
  }

  initCursor();
  initMagnetic();
  initMarquee(lenis);
  initReveals();
  initDeco();
  initAbout(false);
  initExamples(false);
  initTopics(false);
  initStats();
  initAudience();
  initProcess();
  initFooter();
  initStickyCta();
  // Шапку подключаем последней: закреплённая секция тем сдвигает позиции блоков ниже
  initHeader();

  await runIntro(lenis);
  initHeroLive(false);
  ScrollTrigger.refresh();
}

start();
