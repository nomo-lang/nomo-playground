import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import {
  baseLocale,
  localizeUrl,
  overwriteGetLocale,
  overwriteSetLocale,
  toLocale,
  type Locale as ParaglideLocale,
} from "$lib/paraglide/runtime";

export class Locale {
  #current: ParaglideLocale = $state(
    toLocale(browser && document.querySelector("html")?.lang) ?? baseLocale,
  );

  constructor() {
    overwriteGetLocale(() => this.#current);

    overwriteSetLocale((locale) => {
      this.#current = locale;
      goto(localizeUrl(page.url.pathname, { locale }).href);
    });
  }
}
