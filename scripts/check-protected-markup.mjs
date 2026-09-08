import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const changed = execFileSync(
  "git",
  ["diff", "--name-only", "--diff-filter=ACMRT", "HEAD", "--", "*.html"],
  { encoding: "utf8" },
)
  .split(/\r?\n/)
  .filter(Boolean);

const failures = [];
const normalize = (value = "") => value.replace(/\s+/g, " ").trim();
const first = (html, pattern) => normalize(html.match(pattern)?.[1] ?? "");
const all = (html, pattern) => [...html.matchAll(pattern)].map((match) => normalize(match[1]));
const count = (html, needle) => html.split(needle).length - 1;

for (const file of changed) {
  let before;
  try {
    before = execFileSync("git", ["show", `HEAD:${file}`], { encoding: "utf8" });
  } catch {
    continue;
  }
  const after = readFileSync(file, "utf8");

  const protectedSingles = [
    ["title", /<title[^>]*>([\s\S]*?)<\/title>/i],
    ["canonical", /<link[^>]+rel=[\"']canonical[\"'][^>]+href=[\"']([^\"']+)[\"'][^>]*>/i],
  ];
  for (const [label, pattern] of protectedSingles) {
    if (first(before, pattern) !== first(after, pattern)) {
      failures.push(`${file}: ${label} changed`);
    }
  }

  const hreflang = /<link[^>]+hreflang=[\"'][^\"']+[\"'][^>]+href=[\"']([^\"']+)[\"'][^>]*>/gi;
  if (JSON.stringify(all(before, hreflang)) !== JSON.stringify(all(after, hreflang))) {
    failures.push(`${file}: hreflang targets changed`);
  }

  for (const marker of ["products-grid-fixed", "bpf-wa-icon-btn", "locale-switcher"]) {
    if (count(before, marker) !== count(after, marker)) {
      failures.push(`${file}: protected marker ${marker} count changed`);
    }
  }

  if (file.startsWith("content-site/products/")) {
    const imageSrc = /<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>/gi;
    if (JSON.stringify(all(before, imageSrc)) !== JSON.stringify(all(after, imageSrc))) {
      failures.push(`${file}: product image sources changed`);
    }
  }
}

const changedCss = execFileSync("git", ["diff", "--name-only", "HEAD", "--", "*.css"], {
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter(Boolean);
if (changedCss.length) failures.push(`CSS files changed: ${changedCss.join(", ")}`);

const renamedOrDeleted = execFileSync(
  "git",
  ["diff", "--name-status", "--diff-filter=DR", "HEAD"],
  { encoding: "utf8" },
)
  .split(/\r?\n/)
  .filter(Boolean);
if (renamedOrDeleted.length) failures.push(`Deleted or renamed paths: ${renamedOrDeleted.join(", ")}`);

if (failures.length) {
  console.error("Protected-markup check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Protected-markup check passed for ${changed.length} changed HTML files: titles, canonicals, hreflang targets, protected component markers, product image sources, CSS, and paths are unchanged.`,
);
