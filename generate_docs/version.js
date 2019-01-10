const semver = require("semver");
const { resolve } = require("path");
const { execSync } = require("child_process");

const version = execSync("npm show tone version").toString();

const major = parseInt(semver(version).major)
if (major === 0){
	console.log(`r${semver(version).minor}`)
} else {
	console.log(`r${major}`)
}