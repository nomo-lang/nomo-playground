# Nomo Playground

A fast, install-free way to compile and run Nomo in the browser.

The Playground ships the production Nomo lexer, parser, semantic checker, typed
IR, and a capability-free interpreter as WebAssembly. Compilation and execution
stay inside a disposable Web Worker; arbitrary output does not rely on curated
fixtures or JavaScript source-pattern matching.

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
pnpm run verify:wasm
pnpm run build
pnpm run check:cloudflare
```

## Deployment

The production target is Cloudflare Workers Static Assets. The checked-in
`wrangler.jsonc` deploys the SvelteKit worker and its prerendered assets as one
unit. It also declares `https://play.nomo-lang.org` as the production
custom domain so DNS, TLS, and the Worker route remain version-controlled.

To test the production runtime locally:

```sh
pnpm run preview
```

After authenticating Wrangler with the target Cloudflare account, deploy with:

```sh
pnpm run deploy
```

After the production deployment completes, run the HTTP acceptance smoke:

```sh
pnpm run smoke:production
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

- **Check** runs the production lexer, parser, and semantic checker locally.
- **Format** applies the playground's deterministic four-space formatter.
- **Run** compiles source to typed IR and evaluates it in an import-free
  WebAssembly runtime.
- **Copy link** serializes the current source into the URL.

The runtime has a 256 KiB source ceiling, 64 MiB WebAssembly memory ceiling,
instruction-fuel and call-depth limits, a 64 KiB output limit, and a three
second Worker timeout. Filesystem, process, environment, network, interactive
input, and clock access are unavailable in the sandbox. Examples are copied
from the compiler repository and are executed through the same WASM path as
edited source.

The checked-in runtime lives in `static/wasm`. Its source commit, SHA-256,
artifact size, and sandbox ceilings are recorded in
`static/wasm/nomo_wasm.json`. Refresh it from the sibling compiler checkout:

```sh
cd ../nomo
cargo build --locked --release --target wasm32-unknown-unknown -p nomo-wasm
cd ../nomo-playground
cp ../nomo/target/wasm32-unknown-unknown/release/nomo_wasm.wasm \
  static/wasm/nomo_wasm.wasm
pnpm run verify:wasm
```

Organization-wide contribution, security, and support guidance is inherited
from [`nomo-lang/.github`](https://github.com/nomo-lang/.github).
