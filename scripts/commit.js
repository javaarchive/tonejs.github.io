// get the latest version from npm
const {execSync} = require('child_process')

//add the latest docs
execSync("git add ./")
//add the commit
const commitMessage = process.env.TRAVIS ? "- build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE" : "";
execSync(`git commit -m "updating to latest docs ${commitMessage}" -m "Automated commit"`)
// push the commit
// execSync("git push")
