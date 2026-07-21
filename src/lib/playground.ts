import { examples, type Example } from "./data/examples";
import { getPlaygroundCopy } from "./copy";
import { baseLocale, type Locale } from "./paraglide/runtime";

export type DiagnosticSeverity = "error" | "warning";

export type Diagnostic = {
  code: string;
  severity: DiagnosticSeverity;
  line: number;
  column: number;
  message: string;
};

export type RunResult = {
  status: "success" | "preview" | "error";
  output: string;
  note: string;
};

type Bracket = {
  char: "{" | "(" | "[";
  line: number;
  column: number;
};

const openingBrackets = new Set(["{", "(", "["]);
const closingToOpening = new Map([
  ["}", "{"],
  [")", "("],
  ["]", "["],
]);

function normalize(source: string) {
  return source.replaceAll("\r\n", "\n").trim();
}

function structuralDiagnostics(source: string, locale: Locale): Diagnostic[] {
  const copy = getPlaygroundCopy(locale).diagnostics;
  const diagnostics: Diagnostic[] = [];
  const stack: Bracket[] = [];
  let line = 1;
  let column = 0;
  let stringStart: { line: number; column: number } | undefined;
  let escaped = false;
  let inComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    column += 1;

    if (character === "\n") {
      line += 1;
      column = 0;
      inComment = false;
      continue;
    }

    if (inComment) continue;

    if (!stringStart && character === "/" && next === "/") {
      inComment = true;
      index += 1;
      column += 1;
      continue;
    }

    if (stringStart) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "\"") {
        stringStart = undefined;
      }
      continue;
    }

    if (character === "\"") {
      stringStart = { line, column };
      continue;
    }

    if (openingBrackets.has(character)) {
      stack.push({
        char: character as Bracket["char"],
        line,
        column,
      });
      continue;
    }

    const expectedOpening = closingToOpening.get(character);
    if (!expectedOpening) continue;

    const opening = stack.pop();
    if (!opening || opening.char !== expectedOpening) {
      diagnostics.push({
        code: "NOMO-P003",
        severity: "error",
        line,
        column,
        message: copy.unexpectedClosing(character),
      });
    }
  }

  if (stringStart) {
    diagnostics.push({
      code: "NOMO-P004",
      severity: "error",
      line: stringStart.line,
      column: stringStart.column,
      message: copy.unclosedString,
    });
  }

  for (const opening of stack) {
    diagnostics.push({
      code: "NOMO-P002",
      severity: "error",
      line: opening.line,
      column: opening.column,
      message: copy.unmatchedOpening(opening.char),
    });
  }

  return diagnostics;
}

export function analyze(
  source: string,
  locale: Locale = baseLocale,
): Diagnostic[] {
  const copy = getPlaygroundCopy(locale).diagnostics;
  const diagnostics = structuralDiagnostics(source, locale);
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const firstCodeLine = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("//");
  });

  if (
    firstCodeLine === -1 ||
    !/^package\s+[a-zA-Z_][\w.]*/.test(lines[firstCodeLine].trim())
  ) {
    diagnostics.push({
      code: "NOMO-P001",
      severity: "error",
      line: Math.max(firstCodeLine + 1, 1),
      column: 1,
      message: copy.package,
    });
  }

  if (!/\bfn\s+main\s*\(\s*\)\s*->/.test(source)) {
    diagnostics.push({
      code: "NOMO-P005",
      severity: "error",
      line: 1,
      column: 1,
      message: copy.main,
    });
  }

  const imports = new Map<string, number>();
  lines.forEach((lineText, index) => {
    const importName = lineText.trim().match(/^import\s+([\w.]+)$/)?.[1];
    if (importName) {
      const firstLine = imports.get(importName);
      if (firstLine) {
        diagnostics.push({
          code: "NOMO-P101",
          severity: "warning",
          line: index + 1,
          column: 1,
          message: copy.duplicateImport(importName, firstLine),
        });
      } else {
        imports.set(importName, index + 1);
      }
    }

    if (lineText.trimEnd().endsWith(";")) {
      diagnostics.push({
        code: "NOMO-P102",
        severity: "warning",
        line: index + 1,
        column: lineText.lastIndexOf(";") + 1,
        message: copy.semicolon,
      });
    }
  });

  return diagnostics.sort(
    (left, right) => left.line - right.line || left.column - right.column,
  );
}

function countBraces(line: string) {
  let opening = 0;
  let closing = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (!inString && character === "/" && line[index + 1] === "/") break;

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === "\"") inString = false;
      continue;
    }

    if (character === "\"") inString = true;
    else if (character === "{") opening += 1;
    else if (character === "}") closing += 1;
  }

  return { opening, closing };
}

export function formatSource(source: string) {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const formatted: string[] = [];
  let indent = 0;
  let previousBlank = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (!previousBlank && formatted.length > 0) formatted.push("");
      previousBlank = true;
      continue;
    }

    const braces = countBraces(trimmed);
    if (trimmed.startsWith("}")) indent = Math.max(0, indent - 1);
    formatted.push(`${"    ".repeat(indent)}${trimmed}`);

    const closesAfterFirst = trimmed.startsWith("}")
      ? Math.max(0, braces.closing - 1)
      : braces.closing;
    indent = Math.max(0, indent + braces.opening - closesAfterFirst);
    previousBlank = false;
  }

  while (formatted.at(-1) === "") formatted.pop();
  return `${formatted.join("\n")}\n`;
}

function selectedFixture(source: string, selected: Example | undefined) {
  if (selected && normalize(source) === normalize(selected.source)) return selected;
  return examples.find((example) => normalize(example.source) === normalize(source));
}

export function runPreview(
  source: string,
  selected?: Example,
  locale: Locale = baseLocale,
): RunResult {
  const copy = getPlaygroundCopy(locale);
  const errors = analyze(source, locale).filter(
    (diagnostic) => diagnostic.severity === "error",
  );
  if (errors.length > 0) {
    return {
      status: "error",
      output: copy.run.blockedOutput(errors.length),
      note: copy.run.blockedNote,
    };
  }

  const fixture = selectedFixture(source, selected);
  if (fixture) {
    return {
      status: "success",
      output: fixture.output,
      note: copy.run.fixture(copy.examples[fixture.id].title),
    };
  }

  const literals = Array.from(
    source.matchAll(/io\.println\("((?:\\.|[^"\\])*)"\)/g),
    (match) => {
      try {
        return JSON.parse(`"${match[1]}"`) as string;
      } catch {
        return match[1];
      }
    },
  );

  if (literals.length > 0) {
    return {
      status: "preview",
      output: literals.join("\n"),
      note: copy.run.literalNote,
    };
  }

  return {
    status: "preview",
    output: copy.run.noOutput,
    note: copy.run.cliNote,
  };
}

export function encodeSource(source: string) {
  const bytes = new TextEncoder().encode(source);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function decodeSource(encoded: string) {
  try {
    const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(`${normalized}${padding}`);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder().decode(bytes);
  } catch {
    return undefined;
  }
}

export function createShareUrl(base: string, source: string) {
  const url = new URL(base);
  url.search = "";
  url.hash = "";
  url.searchParams.set("code", encodeSource(source));
  return url.toString();
}
