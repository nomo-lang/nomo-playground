export const NOMO_WASM_SHA256 =
  "3c550d54f450007c8275069c74187bccd22d4433f5c926a3a3d6003a8eb87ea9";

export function nomoWasmAssetUrl(
  sha256 = NOMO_WASM_SHA256,
): string {
  return `/wasm/nomo_wasm.wasm?v=${encodeURIComponent(sha256)}`;
}
