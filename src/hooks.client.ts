import { Locale } from "$lib/paraglide.svelte";
import type { ClientInit } from "@sveltejs/kit";

export const init: ClientInit = () => {
  new Locale();
};
