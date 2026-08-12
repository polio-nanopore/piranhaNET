#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import execSync from "child_process";

// Read version from package.json
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")
);
const piranhaVersion = pkg.piranhaVersion;
const piranhaImage = "polionanopore/piranha";

const dockerImage = `${piranhaImage}:${piranhaVersion}`;
const tarPath = path.join(__dirname, '../installer-resources/piranha-docker-image.tar');

console.log(`Pulling ${dockerImage}...`);
execSync(`docker pull ${dockerImage}`, { stdio: 'inherit' });

console.log(`Saving to ${tarPath}...`);
execSync(`docker save ${dockerImage} -o "${tarPath}"`, { stdio: 'inherit' });

console.log("Finished successfully.");
