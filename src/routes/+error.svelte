<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { Pathname } from "$app/types";
  import { m } from "$lib/paraglide/messages.js";
  import { getLocale, localizeHref } from "$lib/paraglide/runtime";

  let locale = $derived(getLocale());
  let homePath = $derived(localizeHref("/", { locale }) as Pathname);
</script>

<svelte:head>
  <title>{page.status} — {m.error_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="error-shell">
  <a
    class="error-shell__wordmark"
    href={`https://www.nomo-lang.org${locale === "zh" ? "/zh/" : "/"}`}
    aria-label={m.error_website()}
  >
    <span aria-hidden="true">N</span>
    Nomo
  </a>
  <section>
    <p>{m.error_kicker({ status: page.status })}</p>
    <h1>{m.error_title()}</h1>
    <div class="error-shell__rule"></div>
    <p class="error-shell__description">{m.error_description()}</p>
    <div class="error-shell__actions">
      <a class="error-shell__primary" href={resolve(homePath)}>
        {m.error_home()}
      </a>
      <a href={`https://www.nomo-lang.org${locale === "zh" ? "/zh/" : "/"}`}>
        {m.error_website()} <span aria-hidden="true">↗</span>
      </a>
    </div>
  </section>
</main>
