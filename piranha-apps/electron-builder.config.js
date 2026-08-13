// NB In order to bundle the Piranha image, you must already have pulled and tarred the 
// correct version of the piranha image locally with ./scripts/pull-and-tar-piranha-docker.js

const bundlePiranhaImage = process.env.BUNDLE_PIRANHA_IMAGE === "true";
const suffix = bundlePiranhaImage ? "full" : "light";

const wd = process.cwd();

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
    artifactName: "${productName} Setup ${version}-${arch}-" + suffix + ".${ext}",
  }
};
