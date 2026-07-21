<script lang="ts">
  type Props = {
    source: string;
    label: string;
    onsourcechange: (source: string) => void;
    oncursorchange: (line: number, column: number) => void;
  };

  type HighlightPart = {
    text: string;
    className?: string;
  };

  const tokenPattern =
    /("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:package|import|fn|let|mut|return|struct|impl|pub|match|if|else|for|break|defer)\b|\b(?:void|string|i64|i32|bool|Result|Option|Array)\b|\b(?:Ok|Err|Some|None)\b|\b\d+\b)/g;
  const newline = "\n";

  let { source, label, onsourcechange, oncursorchange }: Props = $props();
  let textarea: HTMLTextAreaElement;
  let highlight: HTMLDivElement;

  let lines = $derived(source.split("\n"));
  let lineNumbers = $derived(
    Array.from({ length: lines.length }, (_, index) => index + 1),
  );
  let highlightedLines = $derived(lines.map(highlightLine));

  function tokenClass(value: string) {
    if (value.startsWith('"')) return "syntax-string";
    if (value.startsWith("//")) return "syntax-comment";
    if (/^\d+$/.test(value)) return "syntax-number";
    if (/^(void|string|i64|i32|bool|Result|Option|Array)$/.test(value)) {
      return "syntax-type";
    }
    if (/^(Ok|Err|Some|None)$/.test(value)) return "syntax-variant";
    return "syntax-keyword";
  }

  function highlightLine(line: string): HighlightPart[] {
    const parts: HighlightPart[] = [];
    let cursor = 0;

    for (const match of line.matchAll(tokenPattern)) {
      const index = match.index;
      if (index > cursor) {
        parts.push({ text: line.slice(cursor, index) });
      }
      parts.push({
        text: match[0],
        className: tokenClass(match[0]),
      });
      cursor = index + match[0].length;
    }

    if (cursor < line.length) parts.push({ text: line.slice(cursor) });
    return parts;
  }

  function cursorPosition(value: string, offset: number) {
    const beforeCursor = value.slice(0, offset).split("\n");
    return {
      line: beforeCursor.length,
      column: (beforeCursor.at(-1)?.length ?? 0) + 1,
    };
  }

  function reportCursor() {
    const position = cursorPosition(source, textarea.selectionStart);
    oncursorchange(position.line, position.column);
  }

  function syncScroll() {
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  }

  function captureTextarea(node: HTMLTextAreaElement) {
    textarea = node;
  }

  function captureHighlight(node: HTMLDivElement) {
    highlight = node;
  }
</script>

<div class="editor">
  <div class="editor__numbers" aria-hidden="true">
    {#each lineNumbers as line (line)}
      <span>{String(line).padStart(2, "0")}</span>
    {/each}
  </div>
  <div class="editor__canvas">
    <div class="editor__highlight" {@attach captureHighlight}>
      <pre class="syntax-layer" aria-hidden="true">{#each highlightedLines as line, index (index)}{#each line as part, partIndex (partIndex)}<span class={part.className}>{part.text}</span>{/each}{#if index < highlightedLines.length - 1}{newline}{/if}{/each}</pre>
    </div>
    <textarea
      aria-label={label}
      autocapitalize="off"
      autocomplete="off"
      onclick={reportCursor}
      oninput={(event) => onsourcechange(event.currentTarget.value)}
      onkeyup={reportCursor}
      onscroll={syncScroll}
      spellcheck={false}
      {@attach captureTextarea}
      value={source}
    ></textarea>
  </div>
</div>
