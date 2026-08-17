#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const wd = process.cwd();

// Read version from package.json
const pkg = JSON.parse(
  fs.readFileSync(path.join(wd, "package.json"), "utf8")
);
const piranhaVersion = pkg.piranhaVersion;
const piranhaImage = "polionanopore/piranha";

const dockerImage = `${piranhaImage}:${piranhaVersion}`;
const imageDir = path.join(wd, "installer-resources");

if (fs.existsSync(imageDir)) {
  console.log("Installer resources dir already exists")
} else {
  console.log("Creating installer resources dir");
  fs.mkdirSync(imageDir);
}

const tarPath = path.join(imageDir, "piranha-docker-image.tar");

// TODO: DRY on exec options
console.log(`Pulling ${dockerImage}...`);
execSync(`docker pull ${dockerImage}`, { stdio: 'inherit', shell: "/bin/bash" });

console.log(`Saving to ${tarPath}...`);
execSync(`docker save ${dockerImage} -o "${tarPath}"`, { stdio: 'inherit', shell: "/bin/bash" });

console.log("Finished successfully.");
