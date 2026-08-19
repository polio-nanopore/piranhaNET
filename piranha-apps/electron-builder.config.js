// NB In order to bundle the Piranha image, you must already have pulled and tarred the
// correct version of the piranha image locally with ./scripts/pull-and-tar-piranha-docker.js

import * as fs from "fs";
import * as path from "path";

const bundlePiranhaImage = process.env.BUNDLE_PIRANHA_IMAGE === "true";
const suffix = bundlePiranhaImage ? "full" : "light";

// Read piranhaVersion from package.json, and set it as an env var, which the nsh script can read
const wd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(wd, "package.json"), "utf8"));
const piranhaVersion = pkg.piranhaVersion;
process.env.PIRANHA_VERSION = piranhaVersion;

export default {
  appId: "org.polionanopore.piranhanet",
  productName: "PiranhaNET",
  files: ["out/**/*", "node_modules/**/*", "package.json"],
  win: {
    target: ["nsis"],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "PiranhaNET",
    include: "electron-installer-win.nsh",
    artifactName: "${productName} Setup ${version}-${os}-" + suffix + ".${ext}",
  },
};
