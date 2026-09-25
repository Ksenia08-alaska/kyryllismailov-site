import fs from 'node:fs';
import path from 'node:path';

/**
 * Проверяет при сборке, лежит ли файл в папке public.
 * Благодаря этому достаточно положить видео или фото с правильным именем в public/media —
 * сайт сам покажет его вместо заглушки. Нет файла — аккуратная заглушка, а не «битое» видео.
 */
export function mediaExists(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', src.replace(/^\//, '')));
  } catch {
    return false;
  }
}

/** Возвращает путь, только если файл действительно есть */
export function mediaOrNull(src: string | null | undefined): string | null {
  return mediaExists(src) ? (src as string) : null;
}
