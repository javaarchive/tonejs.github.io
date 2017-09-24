#!/bin/bash

SITE_DIR=$(pwd)
DOC_GEN=$SITE_DIR/generate_docs

# clone tone.js
TMP_TONE=$SITE_DIR/tmp/Tone.js
git clone https://github.com/Tonejs/Tone.js $TMP_TONE
cd $TMP_TONE
git checkout master

cd $DOC_GEN
sh generate.sh $TMP_TONE

# also checkout the dev branch
cd $TMP_TONE
git checkout dev

# and generate the docs there
cd $DOC_GEN
sh generate.sh $TMP_TONE dev

# back on the master
cd $TMP_TONE
git checkout master

cd $SITE_DIR

if [ "$TRAVIS" = "true" ]; then
	COMMIT_MESSAGE="- build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE"
else
	COMMIT_MESSAGE=""
fi

# sync the examples dir
cp -a $TMP_TONE/examples/. $SITE_DIR/examples/
git add ./examples
git commit -m "updating to latest examples $COMMIT_MESSAGE" -m "Automated commit"

# and the build
cp -a $TMP_TONE/build/. $SITE_DIR/build/
git add ./build/
git commit -m "updating to latest build $COMMIT_MESSAGE" -m "Automated commit"

# push the changes
git push -f

rm -rf $TMP_TONE
