export const NOMO_WASM_SHA256 =
  "0bc3024e296220be964ae536a51bfcb13949addc67b50241c736167d410a09a2";

export function nomoWasmAssetUrl(
  sha256 = NOMO_WASM_SHA256,
): string {
  return `/wasm/nomo_wasm.wasm?v=${encodeURIComponent(sha256)}`;
}
