import * as fs from "fs";
import * as path from "path";

const bundlePiranhaImage = process.env.BUNDLE_PIRANHA_IMAGE === "true";

const wd = process.cwd();
const pkg = JSON.parse(
  fs.readFileSync(path.join(wd, "package.json"), "utf8")
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
    include: "electron-installer-win.nsh",
    artifactName: "${productName} Setup ${version}-${bundlePiranhaImage ? 'full' : 'light'}.${ext}",
  }
};
