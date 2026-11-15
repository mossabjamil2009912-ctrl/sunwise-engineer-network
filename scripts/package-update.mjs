// Usage: node scripts/package-update.mjs 1.1.0 [distDir]
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const version = process.argv[2];
const dist = resolve(process.argv[3] || "dist");
if (!version) { console.error("Usage: node scripts/package-update.mjs <version> [distDir]"); process.exit(1); }
if (!existsSync(dist)) { console.error(`Build folder not found: ${dist}`); process.exit(1); }
const outDir = resolve("public/app-updates");
mkdirSync(outDir, { recursive: true });
const zip = resolve(outDir, `${version}.zip`);
if (existsSync(zip)) rmSync(zip);
execSync(`zip -qr "${zip}" .`, { cwd: dist, stdio: "inherit" });
const checksum = createHash("sha256").update(readFileSync(zip)).digest("hex");
const manifest = { version, path: `/app-updates/${version}.zip`, checksum };
writeFileSync(resolve(outDir, "latest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("latest.json updated:", manifest);
