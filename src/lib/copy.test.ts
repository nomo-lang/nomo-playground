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
    expect(en.example_game_of_life_title).toBe("Conway's Game of Life");
    expect(zh.example_game_of_life_title).toBe("康威生命游戏");
    expect(zh.example_generic_index_title).toBe("泛型索引");
    expect(zh.notice_running).toContain("WASM");
  });
});
