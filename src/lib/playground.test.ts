import { describe, expect, it } from "vitest";
import { defaultExample } from "./data/examples";
import {
  createShareUrl,
  decodeSource,
  encodeSource,
  formatSource,
} from "./playground";

describe("formatter", () => {
  it("applies deterministic four-space indentation", () => {
    expect(
      formatSource("package app.main\n\nfn main() -> void {\nio.println(\"ok\")\n}\n"),
    ).toBe(
      "package app.main\n\nfn main() -> void {\n    io.println(\"ok\")\n}\n",
    );
  });

  it("does not treat braces inside strings as blocks", () => {
    expect(
      formatSource(
        "package app.main\nfn main() -> void {\nio.println(\"{ ok }\")\n}\n",
      ),
    ).toContain('    io.println("{ ok }")');
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
