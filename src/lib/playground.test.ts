import { describe, expect, it } from "vitest";
import { defaultExample, examples } from "./data/examples";
import {
  createShareUrl,
  decodeSource,
  encodeSource,
  formatSource,
} from "./playground";

describe("formatter", () => {
  it("applies deterministic four-space indentation", () => {
    expect(
      formatSource("package hello_world\n\nfn main() {\nio.println(\"ok\")\n}\n"),
    ).toBe(
      "package hello_world\n\nfn main() {\n    io.println(\"ok\")\n}\n",
    );
  });

  it("does not treat braces inside strings as blocks", () => {
    expect(
      formatSource(
        "package hello_world\nfn main() {\nio.println(\"{ ok }\")\n}\n",
      ),
    ).toContain('    io.println("{ ok }")');
  });
});

describe("canonical example syntax", () => {
  it.each(examples)("keeps $id on manifest-root packages and implicit void", (example) => {
    expect(example.source).toMatch(/^package [a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*\n/);
    expect(example.source).not.toContain("package app.main");
    expect(example.source).not.toMatch(/\bfn\s+\w+\([^)]*\)\s*->\s*void\b/);
  });
});

describe("share links", () => {
  it("round-trips UTF-8 source", () => {
    const source = 'io.println("你好, Nomo")';
    expect(decodeSource(encodeSource(source))).toBe(source);
  });

  it("rejects invalid encoded source", () => {
    expect(decodeSource("%%%")).toBeUndefined();
  });

  it("preserves the deployment base path", () => {
    const shared = createShareUrl(
      "https://nomo-lang.github.io/nomo-playground/",
      defaultExample.source,
    );
    expect(shared).toContain("/nomo-playground/?code=");
  });
});
