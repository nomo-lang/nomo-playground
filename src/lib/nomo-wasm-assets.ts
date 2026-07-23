import manifest from "../../static/wasm/nomo_wasm.json";

export const NOMO_WASM_SHA256 = manifest.sha256;

export function nomoWasmAssetUrl(
  sha256 = NOMO_WASM_SHA256,
): string {
  return `/wasm/nomo_wasm.wasm?v=${encodeURIComponent(sha256)}`;
}
