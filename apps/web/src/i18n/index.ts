import { he, type MessageKey } from "./he";

export type { MessageKey };

/**
 * Type-safe translation lookup. Keys are compile-time checked against the Hebrew
 * catalog; `{param}` placeholders are interpolated from `params`.
 * TODO(shared): swap the catalog import to @atlas/shared/i18n when it ships.
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = he[key];
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
