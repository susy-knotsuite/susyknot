const { statSync } = require("fs");
const { execSync } = require("child_process");

const bundledCLI = "./build/cli.bundled.js";
const defaultPolc = "0.5.8";

const postinstallObtain = () => {
  try {
    statSync(bundledCLI);
    execSync(`node ${bundledCLI} obtain --polc=${defaultPolc}`);
  } catch ({ message }) {
    if (message.includes("no such file")) return;
    throw new Error(
      `Error while attempting to download and cache polc ${defaultPolc}: ${message}`
    );
  }
};

try {
  postinstallObtain();
} catch (error) {
  console.error(error);
}
