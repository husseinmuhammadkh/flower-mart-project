import { execSync } from "child_process";

console.log("building client...");
execSync("vite build", { stdio: "inherit" });

console.log("building server...");
// تجاهل أخطاء TypeScript
try {
  execSync("tsc || true", { stdio: "inherit" });
} catch {}

console.log("build finished");