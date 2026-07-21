const base = new URL(
  process.env.PLAYGROUND_URL ?? "https://playground.nomo-lang.org/",
);

const pages = [
  ["/", 'lang="en"'],
  ["/zh/", 'lang="zh"'],
];

for (const [pathname, marker] of pages) {
  const url = new URL(pathname, base);
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok || !body.includes(marker)) {
    throw new Error(`${url} failed: ${response.status}, marker ${marker}`);
  }
  if (!body.includes(`https://playground.nomo-lang.org${pathname}`)) {
    throw new Error(`${url} is missing its canonical URL`);
  }
}

const icon = await fetch(new URL("/favicon.svg", base));
if (!icon.ok || !icon.headers.get("content-type")?.includes("image/svg+xml")) {
  throw new Error(`favicon failed: ${icon.status}`);
}

const missingPath = `/__nomo_release_smoke_missing_${Date.now()}__`;
const missing = await fetch(new URL(missingPath, base));
const missingBody = await missing.text();
if (missing.status !== 404 || !missingBody.includes("Route not found")) {
  throw new Error(`localized 404 failed: ${missing.status}`);
}

console.log(`Playground production smoke passed for ${base.origin}`);
