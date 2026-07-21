import { describe, expect, it } from "vitest";
import { defaultExample, examples } from "./data/examples";
import {
  analyze,
  createShareUrl,
  decodeSource,
  encodeSource,
  formatSource,
  runPreview,
} from "./playground";

describe("browser analyzer", () => {
  it("accepts every curated example", () => {
    for (const example of examples) {
      expect(analyze(example.source)).toEqual([]);
    }
  });

  it("requires a package declaration and main function", () => {
    const diagnostics = analyze("fn helper() -> void {}\n");
    expect(diagnostics.map(({ code }) => code)).toEqual([
      "NOMO-P001",
      "NOMO-P005",
    ]);
  });

  it("reports unmatched braces and strings with positions", () => {
    const diagnostics = analyze(`package app.main\nfn main() -> void {\n"open`);
    expect(diagnostics.map(({ code }) => code)).toContain("NOMO-P002");
    expect(diagnostics.map(({ code }) => code)).toContain("NOMO-P004");
  });

  it("warns about duplicate imports and semicolons", () => {
    const diagnostics = analyze(
      `package app.main\nimport std.io\nimport std.io\nfn main() -> void {;\n}\n`,
    );
    expect(diagnostics.map(({ code }) => code)).toContain("NOMO-P101");
    expect(diagnostics.map(({ code }) => code)).toContain("NOMO-P102");
  });

  it("localizes diagnostics", () => {
    const diagnostics = analyze("fn helper() -> void {}\n", "zh");
    expect(diagnostics[0]?.message).toContain("package 声明");
  });
});

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

describe("preview runner", () => {
  it("returns the selected fixture output", () => {
    expect(runPreview(defaultExample.source, defaultExample)).toMatchObject({
      status: "success",
      output: "Hello, Nomo",
    });
  });

  it("previews direct literal output in edited source", () => {
    const source =
      'package app.main\nfn main() -> void {\n io.println("first")\n io.println("second")\n}\n';
    expect(runPreview(source)).toMatchObject({
      status: "preview",
      output: "first\nsecond",
    });
  });

  it("blocks source with structural errors", () => {
    expect(runPreview("package app.main")).toMatchObject({
      status: "error",
    });
  });

  it("localizes runner messages", () => {
    expect(runPreview("package app.main", undefined, "zh").note).toContain(
      "修复结构错误",
    );
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
