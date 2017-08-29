#!/usr/bin/env bash

# install jsdocs
npm install -g jsdoc

TMP_DIR=./tmp

# create a tmp dir for the latest tone.js
mkdir $TMP_DIR

# grab tone repo
git clone https://github.com/Tonejs/Tone.js $TMP_DIR/Tone.js

# run the jsdocs
sh jsdoc.sh

# and run it on the dev version also
cd $TMP_DIR/Tone.js
git checkout dev
cd ../../
sh jsdoc.sh

# clean up
rm -rf $TMP_DIR

# add and push the changes
git add ../_data
git commit -m 'updated data'
git add ../_documentations
git commit -m 'updated documentation'

git remote add origin-pages https://${GH_TOKEN}@github.com/Tonejs/tonejs.github.io.git > /dev/null 2>&1
git push --set-upstream origin-pages travis-two
