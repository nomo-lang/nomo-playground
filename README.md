# Nomo Playground

A fast, install-free way to explore real Nomo syntax in the browser.

The first release is deliberately honest about its boundary: it provides a
local structural analyzer, formatter, shareable source links, and a curated
example runner. It does **not** ship the native Nomo compiler in WebAssembly.
Arbitrary programs still need the
[`nomo` CLI](https://github.com/nomo-lang/nomo).

## Local development

Requires Node.js 24 and pnpm 11.

```sh
pnpm install
pnpm run dev
```

Run all validation before opening a pull request:

```sh
pnpm run lint
pnpm test
pnpm run build
pnpm run check:cloudflare
```

## Deployment

The production target is Cloudflare Workers Static Assets. The checked-in
`wrangler.jsonc` deploys the SvelteKit worker and its prerendered assets as one
unit.

To test the production runtime locally:

```sh
pnpm run preview
```

After authenticating Wrangler with the target Cloudflare account, deploy with:

```sh
pnpm run deploy
```

For Cloudflare Git integration, use `pnpm run build` as the build command and
`pnpm exec wrangler deploy` as the deploy command. The generated output lives in
`.svelte-kit/cloudflare` and is served from the domain root.

## Internationalization

English is served at `/` and Simplified Chinese at `/zh/`. The interface,
examples, diagnostics, runner notices, and document metadata are localized.
Share links retain their `code` query parameter when switching languages.
Internationalization uses the official Svelte Paraglide add-on, with source
messages in `messages/en.json` and `messages/zh.json` and locale settings in
`project.inlang/settings.json`. The generated type-safe runtime under
`src/lib/paraglide` is not committed.

## Browser execution model

- **Check** validates structural syntax and required entry points locally.
- **Format** applies the playground's deterministic four-space formatter.
- **Run example** executes the selected curated fixture, or direct literal
  `io.println("…")` calls. It never claims to be the production compiler.
- **Copy link** serializes the current source into the URL.

Examples are copied from the compiler repository and should be refreshed when
their upstream equivalents change.

Organization-wide contribution, security, and support guidance is inherited
from [`nomo-lang/.github`](https://github.com/nomo-lang/.github).
