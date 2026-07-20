<script lang="ts">
  import { onMount } from "svelte";

  import Editor from "$lib/components/Editor.svelte";
  import {
    defaultExample,
    examples,
    findExample,
    type ExampleId,
  } from "$lib/data/examples";
  import {
    analyze,
    createShareUrl,
    decodeSource,
    formatSource,
    runPreview,
    type RunResult,
  } from "$lib/playground";

  type Panel = "output" | "problems";
  const newline = "\n";

  let source = $state(defaultExample.source);
  let selectedId = $state<ExampleId>(defaultExample.id);
  let panel = $state<Panel>("output");
  let runResult = $state<RunResult>(
    runPreview(defaultExample.source, defaultExample),
  );
  let cursor = $state({ line: 1, column: 1 });
  let notice = $state("Ready");

  let selectedExample = $derived(findExample(selectedId) ?? defaultExample);
  let diagnostics = $derived(analyze(source));
  let errors = $derived(
    diagnostics.filter((diagnostic) => diagnostic.severity === "error"),
  );
  let isEdited = $derived(source !== selectedExample.source);

  onMount(loadSharedSource);

  function loadSharedSource() {
    const encoded = new URLSearchParams(window.location.search).get("code");
    const sharedSource = encoded ? decodeSource(encoded) : undefined;
    if (!sharedSource) return;

    source = sharedSource;
    runResult = runPreview(sharedSource);
    notice = "Loaded shared source";
  }

  async function copyText(value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function updateSource(value: string) {
    source = value;
    notice = "Edited";
  }

  function chooseExample(id: ExampleId) {
    const example = findExample(id);
    if (!example) return;

    selectedId = id;
    source = example.source;
    runResult = runPreview(example.source, example);
    panel = "output";
    notice = `Loaded ${example.title}`;
  }

  function checkSource() {
    panel = "problems";
    notice =
      errors.length === 0
        ? "Check complete — no structural errors"
        : `Check complete — ${errors.length} error${errors.length === 1 ? "" : "s"}`;
  }

  function formatCurrentSource() {
    source = formatSource(source);
    notice = "Formatted";
  }

  function runCurrentSource() {
    const result = runPreview(source, selectedExample);
    runResult = result;
    panel = result.status === "error" ? "problems" : "output";
    notice =
      result.status === "error" ? "Run blocked by errors" : "Preview complete";
  }

  async function copyShareLink() {
    const url = createShareUrl(window.location.href, source);
    await copyText(url);
    notice = "Share link copied";
  }

  function handleShortcut(event: KeyboardEvent) {
    const command = event.metaKey || event.ctrlKey;
    if (command && event.key === "Enter") {
      event.preventDefault();
      runCurrentSource();
    }
    if (command && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      formatCurrentSource();
    }
  }

  function upstreamExamplePath(id: ExampleId) {
    if (id === "struct-methods") return "struct_methods";
    if (id === "array") return "array_basic";
    return id;
  }
</script>

<svelte:head>
  <title>Nomo Playground</title>
  <meta
    name="description"
    content="Explore real Nomo syntax with structural diagnostics, formatting, curated output, and shareable source links."
  />
  <meta property="og:title" content="Nomo Playground" />
  <meta
    property="og:description"
    content="A fast, install-free way to explore the Nomo programming language."
  />
</svelte:head>

<svelte:window onkeydown={handleShortcut} />

<div class="app-shell">
  <a class="skip-link" href="#editor">Skip to editor</a>

  <header class="topbar">
    <a
      class="wordmark"
      href="https://nomo-lang.github.io/www.nomo-lang.org/"
    >
      <span aria-hidden="true">N</span>
      Nomo
    </a>
    <div class="product-name">
      <strong>Playground</strong>
      <span>Browser preview</span>
    </div>
    <nav aria-label="Playground links">
      <a href="https://github.com/nomo-lang/nomo/tree/main/docs">Docs</a>
      <a href="https://github.com/nomo-lang/nomo-playground">GitHub</a>
      <a
        class="install-link"
        href="https://github.com/nomo-lang/nomo/releases"
      >
        Install Nomo
        <span aria-hidden="true">↗</span>
      </a>
    </nav>
  </header>

  <div class="preview-note">
    <span>
      <i aria-hidden="true"></i>
      PHASE 1
    </span>
    <p>
      Local structural checker + curated runner. Full compilation requires the
      native Nomo CLI.
    </p>
    <a href="https://github.com/nomo-lang/nomo">
      Get the compiler <span aria-hidden="true">→</span>
    </a>
  </div>

  <main class="workspace">
    <aside class="examples" aria-label="Examples">
      <div class="pane-title">
        <span>EXAMPLES</span>
        <span>{String(examples.length).padStart(2, "0")}</span>
      </div>
      <div class="example-list">
        {#each examples as example, index (example.id)}
          <button
            aria-current={selectedId === example.id}
            class:is-active={selectedId === example.id}
            onclick={() => chooseExample(example.id)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{example.title}</strong>
            <small>{example.focus}</small>
          </button>
        {/each}
      </div>
      <div class="example-detail">
        <span>SELECTED EXAMPLE</span>
        <strong>{selectedExample.title}</strong>
        <p>{selectedExample.description}</p>
        <a
          href="https://github.com/nomo-lang/nomo/tree/main/examples/{upstreamExamplePath(
            selectedExample.id,
          )}"
        >
          View upstream <span aria-hidden="true">↗</span>
        </a>
      </div>
    </aside>

    <section class="source-pane" id="editor">
      <div class="mobile-example">
        <label for="example-select">Example</label>
        <select
          id="example-select"
          onchange={(event) =>
            chooseExample(event.currentTarget.value as ExampleId)}
          value={selectedId}
        >
          {#each examples as example (example.id)}
            <option value={example.id}>{example.title}</option>
          {/each}
        </select>
      </div>
      <div class="source-tabs">
        <div class="file-tab is-active">
          <span aria-hidden="true">◇</span>
          main.nomo
          {#if isEdited}
            <i aria-label="Edited"></i>
          {/if}
        </div>
        <div class="source-tabs__meta">
          <span>NOMO</span>
          <span>UTF-8</span>
        </div>
      </div>
      <div class="toolbar" aria-label="Editor actions">
        <button onclick={formatCurrentSource} type="button">
          Format
          <kbd>⇧⌘F</kbd>
        </button>
        <button onclick={checkSource} type="button">
          Check
          <span class="count" class:is-error={errors.length > 0}>
            {errors.length}
          </span>
        </button>
        <button
          class="run-button"
          onclick={runCurrentSource}
          type="button"
        >
          <span aria-hidden="true">▶</span>
          Run example
          <kbd>⌘↵</kbd>
        </button>
        <button onclick={() => void copyShareLink()} type="button">
          Copy link
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <Editor
        oncursorchange={(line, column) => (cursor = { line, column })}
        onsourcechange={updateSource}
        {source}
      />
      <div class="statusbar">
        <span
          class:status-error={errors.length > 0}
          class:status-ok={errors.length === 0}
        >
          <i aria-hidden="true"></i>
          {errors.length
            ? `${errors.length} error${errors.length === 1 ? "" : "s"}`
            : "Structure valid"}
        </span>
        <span aria-live="polite">{notice}</span>
        <span>Ln {cursor.line}, Col {cursor.column}</span>
      </div>
    </section>

    <section class="result-pane" aria-label="Playground results">
      <div class="result-tabs" role="tablist">
        <button
          aria-selected={panel === "output"}
          class:is-active={panel === "output"}
          onclick={() => (panel = "output")}
          role="tab"
          type="button"
        >
          Output
        </button>
        <button
          aria-selected={panel === "problems"}
          class:is-active={panel === "problems"}
          onclick={() => (panel = "problems")}
          role="tab"
          type="button"
        >
          Problems
          <span>{diagnostics.length}</span>
        </button>
      </div>

      {#if panel === "output"}
        <div class="output-panel" role="tabpanel">
          <div class="output-panel__meta">
            <span>PROGRAM OUTPUT</span>
            <span class="run-status run-status--{runResult.status}">
              {runResult.status}
            </span>
          </div>
          <pre><span class="prompt" aria-hidden="true">$</span> nomo run{newline}<strong>{runResult.output}</strong></pre>
          <p>{runResult.note}</p>
          <div class="native-callout">
            <span>NEED THE REAL BUILD?</span>
            <p>
              Compile arbitrary source to readable C99 and a native binary with
              the Nomo CLI.
            </p>
            <a href="https://github.com/nomo-lang/nomo/releases">
              Download preview <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      {:else}
        <div class="problems-panel" role="tabpanel">
          {#if diagnostics.length === 0}
            <div class="empty-state">
              <span aria-hidden="true">✓</span>
              <strong>No structural problems</strong>
              <p>
                The browser checker found a package, a runnable main function,
                and balanced syntax.
              </p>
            </div>
          {:else}
            <ol>
              {#each diagnostics as diagnostic, index (`${diagnostic.code}-${diagnostic.line}-${index}`)}
                <li class="problem problem--{diagnostic.severity}">
                  <span>{diagnostic.severity === "error" ? "×" : "!"}</span>
                  <div>
                    <strong>{diagnostic.message}</strong>
                    <small>
                      {diagnostic.code} · line {diagnostic.line}, column
                      {diagnostic.column}
                    </small>
                  </div>
                </li>
              {/each}
            </ol>
          {/if}
        </div>
      {/if}
    </section>
  </main>

  <footer class="app-footer">
    <span>Nomo Playground · Phase 1</span>
    <span>Local analysis only — no source leaves your browser</span>
    <a href="https://github.com/nomo-lang/nomo-playground/issues">
      Report an issue ↗
    </a>
  </footer>
</div>
