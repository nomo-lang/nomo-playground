# Nomo Playground

A fast, install-free way to explore real Nomo syntax in the browser.

The first release is deliberately honest about its boundary: it provides a
local structural analyzer, formatter, shareable source links, and a curated
example runner. It does **not** ship the native Nomo compiler in WebAssembly.
Arbitrary programs still need the
[`nomo` CLI](https://github.com/nomo-lang/nomo).

## Local development

Requires Node.js 24 and npm.

```sh
npm install
npm run dev
```

Run all validation before opening a pull request:

```sh
npm run lint
npm test
npm run build
```

## Deployment

Merges to `main` deploy through GitHub Actions to:

<https://nomo-lang.github.io/nomo-playground/>

The Pages build uses `/nomo-playground/` as its Vite base path.

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
