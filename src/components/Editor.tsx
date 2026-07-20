import { useMemo, useRef } from "react";
import { SyntaxHighlight } from "./SyntaxHighlight";

type EditorProps = {
  source: string;
  onChange: (source: string) => void;
  onCursorChange: (line: number, column: number) => void;
};

function cursorPosition(source: string, offset: number) {
  const beforeCursor = source.slice(0, offset).split("\n");
  return {
    line: beforeCursor.length,
    column: (beforeCursor.at(-1)?.length ?? 0) + 1,
  };
}

export function Editor({ source, onChange, onCursorChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbers = useMemo(
    () => Array.from({ length: source.split("\n").length }, (_, index) => index + 1),
    [source],
  );

  const reportCursor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const position = cursorPosition(source, textarea.selectionStart);
    onCursorChange(position.line, position.column);
  };

  const syncScroll = () => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (!textarea || !highlight) return;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  };

  return (
    <div className="editor">
      <div className="editor__numbers" aria-hidden="true">
        {lineNumbers.map((line) => (
          <span key={line}>{String(line).padStart(2, "0")}</span>
        ))}
      </div>
      <div className="editor__canvas">
        <div className="editor__highlight" ref={highlightRef}>
          <SyntaxHighlight source={source} />
        </div>
        <textarea
          aria-label="Nomo source editor"
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(event) => onChange(event.target.value)}
          onClick={reportCursor}
          onKeyUp={reportCursor}
          onScroll={syncScroll}
          ref={textareaRef}
          spellCheck={false}
          value={source}
        />
      </div>
    </div>
  );
}

