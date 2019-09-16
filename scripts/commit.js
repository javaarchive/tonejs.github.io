// get the latest version from npm
const {execSync} = require('child_process')

//add the latest docs
if (execSync('git status --porcelain').toString().trim().length){
	const response = execSync("git add ./").toString()
	//add the commit
	const commitMessage = process.env.TRAVIS ? "- build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE" : "";
	execSync(`git commit -m "updating to latest docs ${commitMessage}" -m "Automated commit"`)
	// push the commit
	execSync("git push")
} else {
	console.log('nothing to commit')
}
