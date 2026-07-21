import type { Handle } from "@sveltejs/kit";

import { localeFromPathname } from "$lib/i18n";

export const handle: Handle = async ({ event, resolve }) => {
  const locale = localeFromPathname(event.url.pathname);
  const languageTag = locale === "zh" ? "zh-CN" : "en";

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", languageTag),
  });
};
