import type {
  NomoResponse,
  NomoWorkerRequest,
  NomoWorkerResponse,
} from "./nomo-runtime";
import { nomoWasmAssetUrl } from "./nomo-wasm-assets";

type NomoWasmExports = WebAssembly.Exports & {
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

type WorkerScope = {
  onmessage: ((event: MessageEvent<NomoWorkerRequest>) => void) | null;
  postMessage(message: NomoWorkerResponse): void;
};

const workerScope = globalThis as unknown as WorkerScope;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
let runtimePromise: Promise<NomoWasmExports> | undefined;

function isNomoWasmExports(
  exports: WebAssembly.Exports,
): exports is NomoWasmExports {
  return (
    exports.memory instanceof WebAssembly.Memory &&
    typeof exports.nomo_alloc === "function" &&
    typeof exports.nomo_dealloc === "function" &&
    typeof exports.nomo_check === "function" &&
    typeof exports.nomo_run === "function" &&
    typeof exports.nomo_result_ptr === "function" &&
    typeof exports.nomo_result_len === "function"
  );
}

async function instantiateRuntime() {
  const response = await fetch(nomoWasmAssetUrl(), {
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(
      `failed to load Nomo WebAssembly (${response.status} ${response.statusText})`,
    );
  }

  let instance: WebAssembly.Instance;
  try {
    const result = await WebAssembly.instantiateStreaming(
      response.clone(),
      {},
    );
    instance = result.instance;
  } catch {
    const result = await WebAssembly.instantiate(
      await response.arrayBuffer(),
      {},
    );
    instance = result.instance;
  }
  if (!isNomoWasmExports(instance.exports)) {
    throw new Error("Nomo WebAssembly exports do not match the runtime ABI");
  }
  return instance.exports;
}

function getRuntime() {
  runtimePromise ??= instantiateRuntime();
  return runtimePromise;
}

function invoke(
  runtime: NomoWasmExports,
  request: NomoWorkerRequest,
): NomoResponse {
  const input = encoder.encode(request.source);
  const pointer = runtime.nomo_alloc(input.length);
  if (pointer === 0) {
    throw new Error("Nomo WebAssembly rejected the source allocation");
  }

  try {
    new Uint8Array(runtime.memory.buffer, pointer, input.length).set(input);
    if (request.operation === "check") {
      runtime.nomo_check(pointer, input.length);
    } else {
      runtime.nomo_run(
        pointer,
        input.length,
        BigInt(request.limits.maxSteps),
        request.limits.maxOutputBytes,
      );
    }

    const resultPointer = runtime.nomo_result_ptr();
    const resultLength = runtime.nomo_result_len();
    const json = decoder.decode(
      new Uint8Array(runtime.memory.buffer, resultPointer, resultLength),
    );
    return JSON.parse(json) as NomoResponse;
  } finally {
    runtime.nomo_dealloc(pointer, input.length);
  }
}

workerScope.onmessage = (event) => {
  const request = event.data;
  void getRuntime()
    .then((runtime) => {
      workerScope.postMessage({
        id: request.id,
        response: invoke(runtime, request),
      });
    })
    .catch((error: unknown) => {
      workerScope.postMessage({
        id: request.id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
};
