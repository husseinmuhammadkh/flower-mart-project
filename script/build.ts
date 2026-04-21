import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  await execAsync("tsc");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});