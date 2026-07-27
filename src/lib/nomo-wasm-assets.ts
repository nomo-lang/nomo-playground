export const NOMO_WASM_SHA256 =
  "7f418958310a41c3a64939a2f965ac676df90091b656d72e51b3119909ff7c37";

export function nomoWasmAssetUrl(
  sha256 = NOMO_WASM_SHA256,
): string {
  return `/wasm/nomo_wasm.wasm?v=${encodeURIComponent(sha256)}`;
}
