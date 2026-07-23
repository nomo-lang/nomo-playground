export const MAX_SOURCE_BYTES = 256 * 1024;

export type NomoOperation = "check" | "run";
export type NomoStatus =
  | "ready"
  | "success"
  | "compile_error"
  | "runtime_error";

export type NomoDiagnostic = {
  code: string;
  severity: string;
  message: string;
  file: string;
  line: number;
  column: number;
  length: number;
  text: string;
  expected: string | null;
  found: string | null;
};

export type NomoRuntimeError = {
  code: string;
  message: string;
};

export type NomoResponse = {
  status: NomoStatus;
  engine: string;
  engine_version: string;
  stdout: string;
  stderr: string;
  diagnostic: NomoDiagnostic | null;
  runtime_error: NomoRuntimeError | null;
  stats: {
    steps: number;
    output_bytes: number;
  };
};

export type NomoWorkerRequest = {
  id: number;
  operation: NomoOperation;
  source: string;
  limits: {
    maxSteps: number;
    maxOutputBytes: number;
  };
};

export type NomoWorkerResponse =
  | {
      id: number;
      response: NomoResponse;
    }
  | {
      id: number;
      error: string;
    };

type ExecuteOptions = {
  timeoutMs?: number;
  maxSteps?: number;
  maxOutputBytes?: number;
};

const DEFAULT_TIMEOUT_MS = 3_000;
const DEFAULT_MAX_STEPS = 100_000;
const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;
let requestId = 0;

export function readyResponse(): NomoResponse {
  return {
    status: "ready",
    engine: "nomo-wasm",
    engine_version: "",
    stdout: "",
    stderr: "",
    diagnostic: null,
    runtime_error: null,
    stats: {
      steps: 0,
      output_bytes: 0,
    },
  };
}

function clientError(code: string, message: string): NomoResponse {
  return {
    ...readyResponse(),
    status: "runtime_error",
    runtime_error: { code, message },
  };
}

export function executeNomo(
  operation: NomoOperation,
  source: string,
  options: ExecuteOptions = {},
): Promise<NomoResponse> {
  const sourceBytes = new TextEncoder().encode(source).length;
  if (sourceBytes > MAX_SOURCE_BYTES) {
    return Promise.resolve(
      clientError(
        "NOMO-WASM-005",
        `source exceeds the browser limit of ${MAX_SOURCE_BYTES} bytes`,
      ),
    );
  }

  const id = ++requestId;
  const worker = new Worker(new URL("./nomo.worker.ts", import.meta.url), {
    name: "nomo-wasm",
    type: "module",
  });

  return new Promise((resolve) => {
    let settled = false;
    const finish = (response: NomoResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      worker.terminate();
      resolve(response);
    };
    const timeout = window.setTimeout(() => {
      finish(
        clientError(
          "NOMO-WASM-006",
          `browser execution exceeded ${options.timeoutMs ?? DEFAULT_TIMEOUT_MS} ms`,
        ),
      );
    }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<NomoWorkerResponse>) => {
      if (event.data.id !== id) return;
      if ("error" in event.data) {
        finish(clientError("NOMO-WASM-007", event.data.error));
      } else {
        finish(event.data.response);
      }
    };
    worker.onerror = (event) => {
      finish(
        clientError(
          "NOMO-WASM-007",
          event.message || "the Nomo WebAssembly worker failed",
        ),
      );
    };
    worker.postMessage({
      id,
      operation,
      source,
      limits: {
        maxSteps: options.maxSteps ?? DEFAULT_MAX_STEPS,
        maxOutputBytes:
          options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES,
      },
    } satisfies NomoWorkerRequest);
  });
}

export function checkNomo(
  source: string,
  options?: ExecuteOptions,
): Promise<NomoResponse> {
  return executeNomo("check", source, options);
}

export function runNomo(
  source: string,
  options?: ExecuteOptions,
): Promise<NomoResponse> {
  return executeNomo("run", source, options);
}
