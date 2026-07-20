import { useCallback, useEffect, useMemo, useState } from "react";
import { Editor } from "./components/Editor";
import {
  defaultExample,
  examples,
  findExample,
  type ExampleId,
} from "./data/examples";
import {
  analyze,
  createShareUrl,
  decodeSource,
  formatSource,
  runPreview,
  type RunResult,
} from "./lib/playground";

type Panel = "output" | "problems";

function initialSource() {
  const encoded = new URLSearchParams(window.location.search).get("code");
  return (encoded && decodeSource(encoded)) || defaultExample.source;
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

export function App() {
  const [source, setSource] = useState(initialSource);
  const [selectedId, setSelectedId] = useState<ExampleId>(defaultExample.id);
  const [panel, setPanel] = useState<Panel>("output");
  const [runResult, setRunResult] = useState<RunResult>(() =>
    runPreview(defaultExample.source, defaultExample),
  );
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [notice, setNotice] = useState("Ready");

  const selectedExample = findExample(selectedId) ?? defaultExample;
  const diagnostics = useMemo(() => analyze(source), [source]);
  const errors = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  );
  const isEdited = source !== selectedExample.source;

  const updateSource = (value: string) => {
    setSource(value);
    setNotice("Edited");
  };

  const chooseExample = (id: ExampleId) => {
    const example = findExample(id);
    if (!example) return;
    setSelectedId(id);
    setSource(example.source);
    setRunResult(runPreview(example.source, example));
    setPanel("output");
    setNotice(`Loaded ${example.title}`);
  };

  const checkSource = useCallback(() => {
    setPanel("problems");
    setNotice(
      errors.length === 0
        ? "Check complete — no structural errors"
        : `Check complete — ${errors.length} error${errors.length === 1 ? "" : "s"}`,
    );
  }, [errors.length]);

  const formatCurrentSource = useCallback(() => {
    setSource((current) => formatSource(current));
    setNotice("Formatted");
  }, []);

  const runCurrentSource = useCallback(() => {
    const result = runPreview(source, selectedExample);
    setRunResult(result);
    setPanel(result.status === "error" ? "problems" : "output");
    setNotice(
      result.status === "error" ? "Run blocked by errors" : "Preview complete",
    );
  }, [selectedExample, source]);

  const copyShareLink = async () => {
    const url = createShareUrl(window.location.href, source);
    window.history.replaceState({}, "", url);
    await copyText(url);
    setNotice("Share link copied");
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key === "Enter") {
        event.preventDefault();
        runCurrentSource();
      }
      if (command && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        formatCurrentSource();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [formatCurrentSource, runCurrentSource]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#editor">
        Skip to editor
      </a>
      <header className="topbar">
        <a className="wordmark" href="https://nomo-lang.github.io/www.nomo-lang.org/">
          <span aria-hidden="true">N</span>
          Nomo
        </a>
        <div className="product-name">
          <strong>Playground</strong>
          <span>Browser preview</span>
        </div>
        <nav aria-label="Playground links">
          <a href="https://github.com/nomo-lang/nomo/tree/main/docs">Docs</a>
          <a href="https://github.com/nomo-lang/nomo-playground">GitHub</a>
          <a
            className="install-link"
            href="https://github.com/nomo-lang/nomo/releases"
          >
            Install Nomo
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div className="preview-note">
        <span>
          <i aria-hidden="true" />
          PHASE 1
        </span>
        <p>
          Local structural checker + curated runner. Full compilation requires
          the native Nomo CLI.
        </p>
        <a href="https://github.com/nomo-lang/nomo">
          Get the compiler <span aria-hidden="true">→</span>
        </a>
      </div>

      <main className="workspace">
        <aside className="examples" aria-label="Examples">
          <div className="pane-title">
            <span>EXAMPLES</span>
            <span>{String(examples.length).padStart(2, "0")}</span>
          </div>
          <div className="example-list">
            {examples.map((example, index) => (
              <button
                aria-current={selectedId === example.id}
                className={selectedId === example.id ? "is-active" : ""}
                key={example.id}
                onClick={() => chooseExample(example.id)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{example.title}</strong>
                <small>{example.focus}</small>
              </button>
            ))}
          </div>
          <div className="example-detail">
            <span>SELECTED EXAMPLE</span>
            <strong>{selectedExample.title}</strong>
            <p>{selectedExample.description}</p>
            <a
              href={`https://github.com/nomo-lang/nomo/tree/main/examples/${selectedExample.id === "struct-methods" ? "struct_methods" : selectedExample.id === "array" ? "array_basic" : selectedExample.id}`}
            >
              View upstream <span aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>

        <section className="source-pane" id="editor">
          <div className="mobile-example">
            <label htmlFor="example-select">Example</label>
            <select
              id="example-select"
              onChange={(event) => chooseExample(event.target.value as ExampleId)}
              value={selectedId}
            >
              {examples.map((example) => (
                <option key={example.id} value={example.id}>
                  {example.title}
                </option>
              ))}
            </select>
          </div>
          <div className="source-tabs">
            <div className="file-tab is-active">
              <span aria-hidden="true">◇</span>
              main.nomo
              {isEdited && <i aria-label="Edited" />}
            </div>
            <div className="source-tabs__meta">
              <span>NOMO</span>
              <span>UTF-8</span>
            </div>
          </div>
          <div className="toolbar" aria-label="Editor actions">
            <button onClick={formatCurrentSource} type="button">
              Format
              <kbd>⇧⌘F</kbd>
            </button>
            <button onClick={checkSource} type="button">
              Check
              <span className={errors.length ? "count is-error" : "count"}>
                {errors.length}
              </span>
            </button>
            <button className="run-button" onClick={runCurrentSource} type="button">
              <span aria-hidden="true">▶</span>
              Run example
              <kbd>⌘↵</kbd>
            </button>
            <button onClick={copyShareLink} type="button">
              Copy link
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <Editor
            onChange={updateSource}
            onCursorChange={(line, column) => setCursor({ line, column })}
            source={source}
          />
          <div className="statusbar">
            <span className={errors.length ? "status-error" : "status-ok"}>
              <i aria-hidden="true" />
              {errors.length
                ? `${errors.length} error${errors.length === 1 ? "" : "s"}`
                : "Structure valid"}
            </span>
            <span>{notice}</span>
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
          </div>
        </section>

        <section className="result-pane" aria-label="Playground results">
          <div className="result-tabs" role="tablist">
            <button
              aria-selected={panel === "output"}
              className={panel === "output" ? "is-active" : ""}
              onClick={() => setPanel("output")}
              role="tab"
              type="button"
            >
              Output
            </button>
            <button
              aria-selected={panel === "problems"}
              className={panel === "problems" ? "is-active" : ""}
              onClick={() => setPanel("problems")}
              role="tab"
              type="button"
            >
              Problems
              <span>{diagnostics.length}</span>
            </button>
          </div>

          {panel === "output" ? (
            <div className="output-panel" role="tabpanel">
              <div className="output-panel__meta">
                <span>PROGRAM OUTPUT</span>
                <span className={`run-status run-status--${runResult.status}`}>
                  {runResult.status}
                </span>
              </div>
              <pre>
                <span className="prompt" aria-hidden="true">
                  $
                </span>{" "}
                nomo run
                {"\n"}
                <strong>{runResult.output}</strong>
              </pre>
              <p>{runResult.note}</p>
              <div className="native-callout">
                <span>NEED THE REAL BUILD?</span>
                <p>
                  Compile arbitrary source to readable C99 and a native binary
                  with the Nomo CLI.
                </p>
                <a href="https://github.com/nomo-lang/nomo/releases">
                  Download preview <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="problems-panel" role="tabpanel">
              {diagnostics.length === 0 ? (
                <div className="empty-state">
                  <span aria-hidden="true">✓</span>
                  <strong>No structural problems</strong>
                  <p>
                    The browser checker found a package, a runnable main
                    function, and balanced syntax.
                  </p>
                </div>
              ) : (
                <ol>
                  {diagnostics.map((diagnostic, index) => (
                    <li
                      className={`problem problem--${diagnostic.severity}`}
                      key={`${diagnostic.code}-${diagnostic.line}-${index}`}
                    >
                      <span>{diagnostic.severity === "error" ? "×" : "!"}</span>
                      <div>
                        <strong>{diagnostic.message}</strong>
                        <small>
                          {diagnostic.code} · line {diagnostic.line}, column{" "}
                          {diagnostic.column}
                        </small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>Nomo Playground · Phase 1</span>
        <span>Local analysis only — no source leaves your browser</span>
        <a href="https://github.com/nomo-lang/nomo-playground/issues">
          Report an issue ↗
        </a>
      </footer>
    </div>
  );
}

