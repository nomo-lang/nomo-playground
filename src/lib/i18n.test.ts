import { describe, expect, it } from "vitest";

import { localeFromPathname, localeHref, messages } from "./i18n";

describe("playground locales", () => {
  it("uses locale-prefixed paths and preserves share queries", () => {
    expect(localeFromPathname("/")).toBe("en");
    expect(localeFromPathname("/zh/")).toBe("zh");
    expect(localeHref("zh", "?code=abc")).toBe("/zh/?code=abc");
    expect(localeHref("en", "?code=abc")).toBe("/?code=abc");
  });

  it("localizes curated example metadata", () => {
    expect(messages.en.examples.arithmetic.title).toBe("Arithmetic");
    expect(messages.zh.examples.arithmetic.title).toBe("算术运算");
  });
});
