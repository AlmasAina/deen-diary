// Copies the website files into www/, the folder Capacitor packages into the Android and iOS apps.
import { cpSync, rmSync, mkdirSync } from "node:fs";
const out = "www";
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const f of ["index.html", "privacy.html", "manifest.webmanifest", "icon.svg", "sw.js", "css", "js", "i18n", "vendor", "garden"]) {
  cpSync(f, `${out}/${f}`, { recursive: true });
}
console.log("www/ is ready");
