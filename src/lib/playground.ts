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
