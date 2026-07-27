# Nomo Playground

Install-free, localized compiler and bounded execution environment for the
early-preview [Nomo language](https://www.nomo-lang.org).

Public site: [play.nomo-lang.org](https://play.nomo-lang.org).

## Status and compatibility

The Playground runs the compiler lexer, parser, semantic checker, typed IR, and
a capability-free interpreter as WebAssembly. Compilation and execution stay
inside a disposable Web Worker; example output is produced by the same runtime
path used for edited source.

The current site source is commit
[`8cf8ba5`](https://github.com/nomo-lang/nomo-playground/commit/8cf8ba507b90c9b825d997e8f1359dd9894f1b1d).
Its checked-in WASM artifact was built from compiler commit
[`6acff2b`](https://github.com/nomo-lang/nomo/commit/6acff2bba0113efa3d49254ec2b9c72e1d442b33);
the artifact SHA-256, size, target, and ceilings are recorded in
`static/wasm/nomo_wasm.json`.

Nomo has no stable `v0.1.0` release. The Playground tracks a reviewed compiler
commit and may show language behavior newer than the packaged timestamp
downloads.

## Try canonical syntax

Open the site and run:

```nomo
package hello_world

import std.io

fn main() {
    io.println("Hello, Nomo")
}
```

Curated examples use lower_snake_case roots that correspond to their project
names and omit `-> void` on no-return declarations. Callable types still keep
their complete return type, such as `task fn(string) -> void`.

## Verified capabilities

Automated tests instantiate the checked-in WebAssembly module and verify:

- the recorded SHA-256 digest and byte length;
- that the module imports no host capabilities;
- all 18 curated examples compile and produce their expected output;
- real compiler diagnostics are returned for invalid source;
- source-size and WebAssembly-memory ceilings are enforced;
- URL sharing, localization catalogs, and the deterministic editor formatter;
- the SvelteKit application, Cloudflare adapter build, and deploy dry-run.

These are browser-sandbox and internal CI claims. They do not establish native
backend equivalence for every program, production service readiness, or broad
performance guarantees.

## Browser execution model

- **Check** runs lexer, parser, and semantic analysis locally.
- **Format** applies the Playground's deterministic four-space editor
  formatter; the CLI formatter remains authoritative for project source.
- **Run** lowers accepted source to typed IR and evaluates it in the
  import-free WebAssembly runtime.
- **Copy link** serializes the current source into the URL.

The runtime enforces:

| Limit or capability | Current behavior |
| --- | --- |
| Source | 256 KiB maximum |
| WebAssembly memory | 64 MiB maximum |
| Output | 64 KiB maximum |
| Execution | Instruction fuel, call-depth, and three-second Worker timeout |
| Host access | No filesystem, process, environment, network, input, or clock |

The `http-server`, sleep, and terminal-style examples demonstrate pure or
deterministic cores; they do not grant network, clock, or terminal access in
the browser.

## Local development

Requires Node.js 24 and pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Run the complete repository gate before a pull request:

```sh
pnpm run verify:wasm
pnpm test
pnpm run lint
pnpm run build
pnpm run check:cloudflare
```

`verify:wasm` is also included in the full Vitest suite. `lint` runs
`svelte-check` with warnings treated as failures. Generated Paraglide output
under `src/lib/paraglide` is not committed and must not be edited manually.

## Refresh the compiler artifact

Build the pinned compiler path from the sibling repository:

```sh
cd ../nomo
cargo build --locked --release --target wasm32-unknown-unknown -p nomo-wasm
cd ../nomo-playground
cp ../nomo/target/wasm32-unknown-unknown/release/nomo_wasm.wasm \
  static/wasm/nomo_wasm.wasm
pnpm run verify:wasm
```

Then update `static/wasm/nomo_wasm.json` and
`src/lib/nomo-wasm-assets.ts` with the exact source commit, digest, and byte
length. A compiler update is incomplete until every curated example executes
through the real artifact.

## Internationalization

English is served at `/` and Simplified Chinese at `/zh/`. Interface copy,
example metadata, diagnostics, runner notices, and document metadata are
localized. Share links retain their `code` query parameter when switching
languages.

Source messages live in `messages/en.json` and `messages/zh.json`; locale
configuration lives in `project.inlang/settings.json`.

## Deployment

The production target is Cloudflare Workers Static Assets. `wrangler.jsonc`
declares `play.nomo-lang.org` and deploys the SvelteKit Worker plus prerendered
assets.

```sh
pnpm run check:cloudflare
pnpm run deploy
pnpm run smoke:production
```

The dry-run is safe for pull requests. `deploy` changes production and requires
the target Cloudflare account; `smoke:production` is run only after a completed
deployment. Cloudflare Git integration uses `pnpm run build` followed by
`pnpm exec wrangler deploy`.

## Authority and contribution

The Playground is an executable teaching and compatibility surface, not a
normative specification. For language behavior, consult the
[English specification](https://github.com/nomo-lang/rfcs/blob/main/en/SPEC.md),
[中文规范](https://github.com/nomo-lang/rfcs/blob/main/zh-CN/SPEC.md),
[RFC 0021](https://github.com/nomo-lang/rfcs/blob/main/en/0021-module-system-imports.md),
and
[RFC 0041](https://github.com/nomo-lang/rfcs/blob/main/en/0041-implicit-void-return-omission.md).

Organization contribution, security, and support guidance is inherited from
[`nomo-lang/.github`](https://github.com/nomo-lang/.github).

## License

See [LICENSE](LICENSE).
