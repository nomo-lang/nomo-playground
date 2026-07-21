import { locales } from "$lib/i18n";

export function match(param: string): param is (typeof locales)[number] {
  return locales.includes(param as (typeof locales)[number]);
}
