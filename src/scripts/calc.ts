import { gsap } from 'gsap';

/**
 * Калькулятор окупаемости: N = ceil(цена пакета / прибыль с одной продажи).
 * Кнопки с суммами дают готовый пример, поле — своя сумма.
 * Принимает запятую и точку; ноль, минус и буквы не считаются.
 */
export function parseMargin(raw: string): number | null {
  const clean = raw.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(clean)) return null;
  const v = Number(clean);
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** «1 новой продажи», «20 новых продаж» — после слова «достаточно» */
const salesWord = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'новой продажи' : 'новых продаж');

export function initCalc(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-calc]');
  if (!root) return;
  const price = Number(root.dataset.price);
  const input = root.querySelector<HTMLInputElement>('[data-calc-input]')!;
  const empty = root.querySelector<HTMLElement>('[data-calc-empty]')!;
  const answer = root.querySelector<HTMLElement>('[data-calc-answer]')!;
  const nEl = root.querySelector<HTMLElement>('[data-calc-n]')!;
  const textEl = root.querySelector<HTMLElement>('[data-calc-text]')!;
  const result = root.querySelector<HTMLElement>('.calc__result');
  const presets = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-calc-preset]'));

  const shown = { v: Number(nEl.textContent) || 0 };

  const setActive = (value: number | null) => {
    presets.forEach((b) => {
      const on = Number(b.dataset.calcPreset) === value;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };

  const show = (m: number | null) => {
    if (m === null) {
      answer.hidden = true;
      empty.hidden = false;
      return;
    }
    const n = Math.ceil(price / m);
    empty.hidden = true;
    answer.hidden = false;
    textEl.textContent = salesWord(n);

    if (reduced) {
      nEl.textContent = String(n);
      return;
    }
    gsap.to(shown, {
      v: n,
      duration: 0.7,
      ease: 'expo.out',
      overwrite: true,
      onUpdate: () => {
        nEl.textContent = String(Math.round(shown.v));
      },
    });
    if (result) gsap.fromTo(result, { scale: 0.98 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  };

  presets.forEach((b) =>
    b.addEventListener('click', () => {
      const v = Number(b.dataset.calcPreset);
      input.value = '';
      setActive(v);
      show(v);
    }),
  );

  input.addEventListener('input', () => {
    if (input.value.trim() === '') {
      // Поле очистили — возвращаемся к примеру по умолчанию
      const def = Number(presets.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.calcPreset) || 30;
      setActive(def);
      show(def);
      return;
    }
    const m = parseMargin(input.value);
    setActive(null);
    show(m);
  });
}
