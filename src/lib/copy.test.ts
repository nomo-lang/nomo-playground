import { describe, expect, it } from "vitest";

import en from "../../messages/en.json";
import zh from "../../messages/zh.json";

describe("playground message catalogs", () => {
  it("keeps locale keys in sync", () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });

  it("contains translated examples and runtime states", () => {
    expect(en.example_arithmetic_title).toBe("Arithmetic");
    expect(zh.example_arithmetic_title).toBe("算术运算");
    expect(zh.notice_running).toContain("WASM");
  });
});
