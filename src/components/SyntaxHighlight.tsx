import { Fragment, type ReactNode } from "react";

const tokenPattern =
  /("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:package|import|fn|let|mut|return|struct|impl|pub|match|if|else|for|break|defer)\b|\b(?:void|string|i64|i32|bool|Result|Option|Array)\b|\b(?:Ok|Err|Some|None)\b|\b\d+\b)/g;

function tokenClass(token: string) {
  if (token.startsWith("\"")) return "syntax-string";
  if (token.startsWith("//")) return "syntax-comment";
  if (/^\d+$/.test(token)) return "syntax-number";
  if (/^(void|string|i64|i32|bool|Result|Option|Array)$/.test(token)) {
    return "syntax-type";
  }
  if (/^(Ok|Err|Some|None)$/.test(token)) return "syntax-variant";
  return "syntax-keyword";
}

function highlightLine(line: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const index = match.index;
    if (index > cursor) nodes.push(line.slice(cursor, index));
    nodes.push(
      <span className={tokenClass(match[0])} key={`${index}-${match[0]}`}>
        {match[0]}
      </span>,
    );
    cursor = index + match[0].length;
  }

  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
}

export function SyntaxHighlight({ source }: { source: string }) {
  return (
    <pre className="syntax-layer" aria-hidden="true">
      {source.split("\n").map((line, index) => (
        <Fragment key={index}>
          {highlightLine(line)}
          {index < source.split("\n").length - 1 && "\n"}
        </Fragment>
      ))}
    </pre>
  );
}

