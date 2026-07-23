export const NOMO_WASM_SHA256 =
  "1ccd7db5b0673580646d647b6815d3f8204b0f01a026718c8bf1048852f32a6e";

export function nomoWasmAssetUrl(
  sha256 = NOMO_WASM_SHA256,
): string {
  return `/wasm/nomo_wasm.wasm?v=${encodeURIComponent(sha256)}`;
}
