import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const distDir = path.join(repoRoot, "dist");
const packageJsonPath = path.join(repoRoot, "package.json");

if (!fs.existsSync(distDir)) {
  throw new Error("Missing ../dist/. Run `npm run build` from the repository root first.");
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

function readSize(relativeFile) {
  if (!relativeFile) return null;

  const absoluteFile = path.resolve(repoRoot, relativeFile);
  if (!fs.existsSync(absoluteFile)) return null;

  const contents = fs.readFileSync(absoluteFile);
  return {
    raw: contents.byteLength,
    gzip: zlib.gzipSync(contents, { level: zlib.constants.Z_BEST_COMPRESSION }).byteLength,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

const entrySizes = Object.entries(pkg.exports)
  .filter(([entryPoint]) => entryPoint !== "./package.json")
  .map(([entryPoint, target]) => {
    const label = entryPoint === "." ? "core" : entryPoint.replace("./", "");
    const esmFile = typeof target === "string" ? target : target.import?.default;
    const cjsFile = typeof target === "string" ? null : target.require?.default;
    const esm = readSize(esmFile);
    const cjs = cjsFile ? readSize(cjsFile) : null;

    return {
      entryPoint: label,
      esmFile,
      esm,
      cjsFile,
      cjs,
    };
  });

console.log("Built entry-point sizes from ../dist/");
console.table(
  entrySizes.map(({ entryPoint, esmFile, esm, cjsFile, cjs }) => ({
    entryPoint,
    esm: esmFile,
    "esm raw": esm ? formatBytes(esm.raw) : "missing",
    "esm gzip": esm ? formatBytes(esm.gzip) : "missing",
    cjs: cjsFile ?? "n/a",
    "cjs raw": cjs ? formatBytes(cjs.raw) : cjsFile ? "missing" : "n/a",
    "cjs gzip": cjs ? formatBytes(cjs.gzip) : cjsFile ? "missing" : "n/a",
    status: esm && (!cjsFile || cjs) ? "built" : "missing output",
  })),
);

const coreEntry = entrySizes.find(({ entryPoint }) => entryPoint === "core");
const rankedEntries = entrySizes.filter((entry) => entry.esm);
const gzipRanking = [...rankedEntries]
  .sort((left, right) => left.esm.gzip - right.esm.gzip)
  .map((entry, index, ranking) => ({
    rank: index + 1,
    entryPoint: entry.entryPoint,
    "esm gzip": formatBytes(entry.esm.gzip),
    "delta vs smallest": `${entry.esm.gzip - ranking[0].esm.gzip} B`,
    "delta vs core": coreEntry?.esm ? `${entry.esm.gzip - coreEntry.esm.gzip} B` : "n/a",
  }));

console.log("ESM gzip ranking (use this to compare import-path alternatives)");
console.table(gzipRanking);

const totals = entrySizes.reduce(
  (summary, entry) => {
    if (entry.esm) {
      summary.esmRaw += entry.esm.raw;
      summary.esmGzip += entry.esm.gzip;
    }
    if (entry.cjs) {
      summary.cjsRaw += entry.cjs.raw;
      summary.cjsGzip += entry.cjs.gzip;
    }
    return summary;
  },
  { esmRaw: 0, esmGzip: 0, cjsRaw: 0, cjsGzip: 0 },
);

console.log("Aggregate footprint across published entry points");
console.table([
  {
    format: "esm total",
    raw: formatBytes(totals.esmRaw),
    gzip: formatBytes(totals.esmGzip),
  },
  {
    format: "cjs total",
    raw: formatBytes(totals.cjsRaw),
    gzip: formatBytes(totals.cjsGzip),
  },
]);
