import * as fs from "fs";
import * as path from "path";

const bundlePiranhaImage = process.env.BUNDLE_PIRANHA_IMAGE === "true";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), 'utf8')
);
const piranhaVersion = pkg.piranhaVersion;

export default {
  appId: "org.polionanopore.piranhanet",
  productName: "PiranhaNET",
  files: [
    "out/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  win: {
    target: [
      "nsis"
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "PiranhaNET",
    customNsis: "electron-installer-win.nsh",
    artifactName: `${productName} Setup ${version}-${bundlePiranhaImage ? 'full' : 'light'}.${ext}`,
    defines: {
      BUNDLE_PIRANHA_IMAGE: bundlePiranhaImage ? "true" : "false",
      PIRANHA_VERSION: piranhaVersion
    }
  }
};
