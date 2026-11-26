import { inTelegram, tg } from './tg';

// Внутри Telegram прогресс хранится в облаке Telegram (виден с любого телефона ученика).
// В обычном браузере — в памяти браузера. Позже заменим на общую базу данных.
const cloud = tg && inTelegram && tg.isVersionAtLeast('6.9') ? tg.CloudStorage : null;

const CLOUD_TIMEOUT_MS = 4000;

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // хранилище недоступно (например, приватный режим) — просто не сохраняем
  }
}

export function loadMany(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  if (!cloud) {
    for (const key of keys) {
      const value = readLocal(key);
      if (value !== null) result[key] = value;
    }
    return Promise.resolve(result);
  }

  if (keys.length === 0) return Promise.resolve(result);

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(result), CLOUD_TIMEOUT_MS);
    cloud.getItems(keys, (error, values) => {
      window.clearTimeout(timer);
      if (!error && values) {
        for (const [key, value] of Object.entries(values)) {
          if (value) result[key] = value;
        }
      }
      resolve(result);
    });
  });
}

export async function load(key: string): Promise<string | null> {
  const values = await loadMany([key]);
  return values[key] ?? null;
}

export function save(key: string, value: string) {
  if (cloud) cloud.setItem(key, value);
  else writeLocal(key, value);
}
