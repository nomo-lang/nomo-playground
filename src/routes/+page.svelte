<script lang="ts">
  import { resolve } from "$app/paths";
  import { onMount } from "svelte";

  import Editor from "$lib/components/Editor.svelte";
  import {
    defaultExample,
    examples,
    findExample,
    type ExampleId,
  } from "$lib/data/examples";
  import { getPlaygroundCopy } from "$lib/copy";
  import {
    checkNomo,
    readyResponse,
    runNomo,
    type NomoDiagnostic,
    type NomoResponse,
  } from "$lib/nomo-runtime";
  import { getLocale, localizeHref } from "$lib/paraglide/runtime";
  import {
    createShareUrl,
    decodeSource,
    formatSource,
  } from "$lib/playground";

  type Panel = "output" | "problems";
  type DisplayStatus = "ready" | "running" | "success" | "error";
  const newline = "\n";

  let locale = $derived(getLocale());
  let copy = $derived(getPlaygroundCopy(locale));
  let switchSearch = $state("");

  let source = $state(defaultExample.source);
  let selectedId = $state<ExampleId>(defaultExample.id);
  let panel = $state<Panel>("output");
  let runResult = $state<NomoResponse>(readyResponse());
  let diagnostics = $state<NomoDiagnostic[]>([]);
  let busy = $state(false);
  let hasValidated = $state(false);
  let operationVersion = 0;
  let cursor = $state({ line: 1, column: 1 });
  let notice = $state<string>(getPlaygroundCopy(getLocale()).notices.ready);

  let selectedExample = $derived(findExample(selectedId) ?? defaultExample);
  let selectedExampleCopy = $derived(copy.examples[selectedExample.id]);
  let errors = $derived(
    diagnostics.filter((diagnostic) => diagnostic.severity === "error"),
  );
  let isEdited = $derived(source !== selectedExample.source);
  let displayStatus = $derived.by<DisplayStatus>(() => {
    if (busy) return "running";
    if (runResult.status === "success") return "success";
    if (
      runResult.status === "compile_error" ||
      runResult.status === "runtime_error"
    ) {
      return "error";
    }
    return "ready";
  });
  let displayOutput = $derived.by(() => {
    if (busy) return copy.run.runningOutput;
    if (runResult.status === "runtime_error") {
      return runResult.runtime_error
        ? `${runResult.runtime_error.code}: ${runResult.runtime_error.message}`
        : copy.run.emptyOutput;
    }
    return runResult.stdout || copy.run.emptyOutput;
  });
  let runNote = $derived.by(() => {
    if (busy) return copy.notices.running;
    if (runResult.status === "success") {
      return copy.run.successNote(
        runResult.stats.steps,
        runResult.stats.output_bytes,
      );
    }
    if (runResult.status === "compile_error") {
      return copy.run.compileErrorNote;
    }
    if (runResult.status === "runtime_error") {
      return copy.run.runtimeErrorNote(
        runResult.runtime_error?.code ?? "NOMO-WASM-007",
      );
    }
    return copy.run.readyNote;
  });

  onMount(() => {
    switchSearch = window.location.search;
    loadSharedSource();
    void runCurrentSource();
  });

  function targetLocale() {
    return locale === "en" ? "zh" : "en";
  }

  function loadSharedSource() {
    const encoded = new URLSearchParams(window.location.search).get("code");
    const sharedSource = encoded ? decodeSource(encoded) : undefined;
    if (!sharedSource) return;

    source = sharedSource;
    notice = copy.notices.shared;
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
    operationVersion += 1;
    source = value;
    runResult = readyResponse();
    diagnostics = [];
    busy = false;
    hasValidated = false;
    notice = copy.notices.edited;
  }

  function chooseExample(id: ExampleId) {
    const example = findExample(id);
    if (!example) return;

    selectedId = id;
    source = example.source;
    panel = "output";
    notice = copy.notices.loaded(copy.examples[example.id].title);
    void runCurrentSource();
  }

  function setDiagnostics(response: NomoResponse) {
    diagnostics = response.diagnostic ? [response.diagnostic] : [];
  }

  async function checkSource() {
    const version = ++operationVersion;
    busy = true;
    panel = "problems";
    notice = copy.notices.checking;
    const response = await checkNomo(source);
    if (version !== operationVersion) return;

    busy = false;
    hasValidated = true;
    runResult = response;
    setDiagnostics(response);
    notice = copy.notices.checked(
      response.status === "compile_error" ? 1 : 0,
    );
  }

  function formatCurrentSource() {
    updateSource(formatSource(source));
    notice = copy.notices.formatted;
  }

  async function runCurrentSource() {
    const version = ++operationVersion;
    busy = true;
    panel = "output";
    notice = copy.notices.running;
    const response = await runNomo(source);
    if (version !== operationVersion) return;

    busy = false;
    hasValidated = true;
    runResult = response;
    setDiagnostics(response);
    panel = response.status === "compile_error" ? "problems" : "output";
    if (response.status === "compile_error") {
      notice = copy.notices.blocked;
    } else if (response.status === "runtime_error") {
      notice = copy.notices.failed;
    } else {
      notice = copy.notices.complete;
    }
  }

  async function copyShareLink() {
    const url = createShareUrl(window.location.href, source);
    await copyText(url);
    notice = copy.notices.copied;
  }

  function handleShortcut(event: KeyboardEvent) {
    const command = event.metaKey || event.ctrlKey;
    if (command && event.key === "Enter") {
      event.preventDefault();
      void runCurrentSource();
    }
    if (command && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      formatCurrentSource();
    }
  }
</script>

<svelte:head>
  <title>{copy.meta.title}</title>
  <meta name="description" content={copy.meta.description} />
  <meta property="og:title" content={copy.meta.title} />
  <meta property="og:description" content={copy.meta.ogDescription} />
  <link
    rel="canonical"
    href={`https://play.nomo-lang.org${localizeHref("/")}`}
  />
  <link
    rel="alternate"
    hreflang="en"
    href="https://play.nomo-lang.org/"
  />
  <link
    rel="alternate"
    hreflang="zh-CN"
    href="https://play.nomo-lang.org/zh/"
  />
  <link
    rel="alternate"
    hreflang="x-default"
    href="https://play.nomo-lang.org/"
  />
</svelte:head>

<svelte:window onkeydown={handleShortcut} />

<div class="app-shell">
  <a class="skip-link" href="#editor">{copy.skip}</a>

  <header class="topbar">
    <a class="wordmark" href="https://www.nomo-lang.org/">
      <span aria-hidden="true">N</span>
      Nomo
    </a>
    <div class="product-name">
      <strong>Playground</strong>
      <span>{copy.browserPreview}</span>
    </div>
    <nav aria-label={copy.navLabel}>
      <a
        href={`https://www.nomo-lang.org${locale === "zh" ? "/zh" : ""}/docs/`}
      >
        {copy.nav[0]}
      </a>
      <a href="https://github.com/nomo-lang/nomo-playground">
        {copy.nav[1]}
      </a>
      <a
        class="locale-link"
        data-sveltekit-reload
        href={resolve(
          `${localizeHref("/", {
            locale: targetLocale(),
          })}${switchSearch}` as "/",
        )}
      >
        {copy.switchLanguage}
      </a>
      <a
        class="install-link"
        href="https://github.com/nomo-lang/nomo/releases"
      >
        {copy.nav[2]}
        <span aria-hidden="true">↗</span>
      </a>
    </nav>
  </header>

  <div class="preview-note">
    <span>
      <i aria-hidden="true"></i>
      {copy.phase}
    </span>
    <p>{copy.phaseNote}</p>
    <a href="https://github.com/nomo-lang/nomo">
      {copy.getCompiler} <span aria-hidden="true">→</span>
    </a>
  </div>

  <main class="workspace">
    <aside class="examples" aria-label={copy.examplesLabel}>
      <div class="pane-title">
        <span>{copy.examplesLabel}</span>
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
            <strong>{copy.examples[example.id].title}</strong>
            <small>{copy.examples[example.id].focus}</small>
          </button>
        {/each}
      </div>
      <div class="example-detail">
        <span>{copy.selectedExample}</span>
        <strong>{selectedExampleCopy.title}</strong>
        <p>{selectedExampleCopy.description}</p>
        {#if selectedExample.upstreamPath}
          <a
            href="https://github.com/nomo-lang/nomo/tree/main/examples/{selectedExample.upstreamPath}"
          >
            {copy.viewUpstream} <span aria-hidden="true">↗</span>
          </a>
        {/if}
      </div>
    </aside>

    <section class="source-pane" id="editor">
      <div class="mobile-example">
        <label for="example-select">{copy.example}</label>
        <select
          id="example-select"
          onchange={(event) =>
            chooseExample(event.currentTarget.value as ExampleId)}
          value={selectedId}
        >
          {#each examples as example (example.id)}
            <option value={example.id}>{copy.examples[example.id].title}</option>
          {/each}
        </select>
      </div>
      <div class="source-tabs">
        <div class="file-tab is-active">
          <span aria-hidden="true">◇</span>
          main.nomo
          {#if isEdited}
            <i aria-label={copy.editedLabel}></i>
          {/if}
        </div>
        <div class="source-tabs__meta">
          <span>NOMO</span>
          <span>UTF-8</span>
        </div>
      </div>
      <div class="toolbar" aria-label={copy.editorActions}>
        <button onclick={formatCurrentSource} type="button">
          {copy.actions[0]}
          <kbd>⇧⌘F</kbd>
        </button>
        <button disabled={busy} onclick={() => void checkSource()} type="button">
          {copy.actions[1]}
          <span class="count" class:is-error={errors.length > 0}>
            {errors.length}
          </span>
        </button>
        <button
          class="run-button"
          disabled={busy}
          onclick={() => void runCurrentSource()}
          type="button"
        >
          <span aria-hidden="true">▶</span>
          {copy.actions[2]}
          <kbd>⌘↵</kbd>
        </button>
        <button onclick={() => void copyShareLink()} type="button">
          {copy.actions[3]}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <Editor
        label={copy.editorLabel}
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
            ? copy.errorCount(errors.length)
            : copy.compilerReady}
        </span>
        <span aria-live="polite">{notice}</span>
        <span>{copy.cursor(cursor.line, cursor.column)}</span>
      </div>
    </section>

    <section class="result-pane" aria-label={copy.resultsLabel}>
      <div class="result-tabs" role="tablist">
        <button
          aria-selected={panel === "output"}
          class:is-active={panel === "output"}
          onclick={() => (panel = "output")}
          role="tab"
          type="button"
        >
          {copy.tabs[0]}
        </button>
        <button
          aria-selected={panel === "problems"}
          class:is-active={panel === "problems"}
          onclick={() => (panel = "problems")}
          role="tab"
          type="button"
        >
          {copy.tabs[1]}
          <span>{diagnostics.length}</span>
        </button>
      </div>

      {#if panel === "output"}
        <div class="output-panel" role="tabpanel">
          <div class="output-panel__meta">
            <span>{copy.programOutput}</span>
            <span class="run-status run-status--{displayStatus}">
              {copy.statuses[displayStatus]}
            </span>
          </div>
          <pre><span class="prompt" aria-hidden="true">$</span> nomo run --sandbox{newline}<strong>{displayOutput}</strong></pre>
          {#if !busy && runResult.stderr}
            <div class="stderr-output">
              <span>{copy.run.stderrLabel}</span>
              <pre>{runResult.stderr}</pre>
            </div>
          {/if}
          <p>{runNote}</p>
          <div class="native-callout">
            <span>{copy.realBuild}</span>
            <p>{copy.realBuildNote}</p>
            <a href="https://github.com/nomo-lang/nomo/releases">
              {copy.downloadPreview} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      {:else}
        <div class="problems-panel" role="tabpanel">
          {#if diagnostics.length === 0}
            <div class="empty-state">
              <span aria-hidden="true">{hasValidated ? "✓" : "…"}</span>
              <strong>
                {hasValidated ? copy.noProblems : copy.awaitingCheck}
              </strong>
              <p>
                {hasValidated
                  ? copy.noProblemsNote
                  : copy.awaitingCheckNote}
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
                      {diagnostic.code} · {copy.location(
                        diagnostic.line,
                        diagnostic.column,
                      )}
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
    <span>{copy.footer[0]}</span>
    <span>{copy.footer[1]}</span>
    <a href="https://github.com/nomo-lang/nomo-playground/issues">
      {copy.footer[2]}
    </a>
  </footer>
</div>
