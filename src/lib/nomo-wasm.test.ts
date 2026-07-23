import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { beforeAll, describe, expect, it } from "vitest";

import { examples } from "./data/examples";
import {
  executeNomo,
  MAX_SOURCE_BYTES,
  type NomoResponse,
} from "./nomo-runtime";

type NomoWasmExports = {
  memory: WebAssembly.Memory;
  nomo_alloc(length: number): number;
  nomo_dealloc(pointer: number, capacity: number): void;
  nomo_check(pointer: number, length: number): void;
  nomo_run(
    pointer: number,
    length: number,
    maxSteps: bigint,
    maxOutputBytes: number,
  ): void;
  nomo_result_ptr(): number;
  nomo_result_len(): number;
};

const expectedOutputs: Record<string, string> = {
  hello: Array.from(
    { length: 10 },
    (_, index) => `Hello, Nomo ${index}\n`,
  ).join(""),
  arithmetic: "35\n-35\n",
  "struct-methods": "a@nomo.dev\n",
  array: "array ok\n",
};

let bytes: Uint8Array<ArrayBuffer>;
let module: WebAssembly.Module;
let runtime: NomoWasmExports;

function invoke(
  operation: "check" | "run",
  source: string,
): NomoResponse {
  const input = new TextEncoder().encode(source);
  const pointer = runtime.nomo_alloc(input.length);
  expect(pointer).not.toBe(0);

  try {
    new Uint8Array(runtime.memory.buffer, pointer, input.length).set(input);
    if (operation === "check") {
      runtime.nomo_check(pointer, input.length);
    } else {
      runtime.nomo_run(pointer, input.length, 100_000n, 64 * 1024);
    }
    const result = new Uint8Array(
      runtime.memory.buffer,
      runtime.nomo_result_ptr(),
      runtime.nomo_result_len(),
    );
    return JSON.parse(new TextDecoder().decode(result)) as NomoResponse;
  } finally {
    runtime.nomo_dealloc(pointer, input.length);
  }
}

beforeAll(async () => {
  const file = await readFile(
    new URL("../../static/wasm/nomo_wasm.wasm", import.meta.url),
  );
  bytes = new Uint8Array(file.byteLength);
  bytes.set(file);
  module = new WebAssembly.Module(bytes);
  const instance = await WebAssembly.instantiate(module, {});
  runtime = instance.exports as unknown as NomoWasmExports;
});

describe("nomo WebAssembly artifact", () => {
  it("matches its provenance and has no host imports", async () => {
    const manifest = JSON.parse(
      await readFile(
        new URL("../../static/wasm/nomo_wasm.json", import.meta.url),
        "utf8",
      ),
    ) as { bytes: number; sha256: string };

    expect(bytes.length).toBe(manifest.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      manifest.sha256,
    );
    expect(WebAssembly.Module.imports(module)).toEqual([]);
  });

  it.each(examples)("compiles and executes $id through the real runtime", (example) => {
    const response = invoke("run", example.source);
    expect(response.status, JSON.stringify(response, null, 2)).toBe("success");
    expect(response.stdout).toBe(expectedOutputs[example.id]);
    expect(response.engine).toBe("nomo-wasm");
  });

  it("returns the production compiler diagnostic for invalid source", () => {
    const response = invoke(
      "check",
      `package app.main

import std.io

fn main() -> void {
    for let i ui64 = 0; i < 10; i++ {
        io.println("never")
    }
}
`,
    );

    expect(response.status).toBe("compile_error");
    expect(response.diagnostic?.code).toBe("E0213");
  });

  it("enforces source and memory ceilings", async () => {
    const response = await executeNomo("run", "x".repeat(MAX_SOURCE_BYTES + 1));
    expect(response.runtime_error?.code).toBe("NOMO-WASM-005");
    expect(runtime.nomo_alloc(MAX_SOURCE_BYTES + 1)).toBe(0);
    expect(() => runtime.memory.grow(1024)).toThrow(RangeError);
  });
});
