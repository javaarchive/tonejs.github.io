#!/bin/bash

PWD=$(pwd)
DOC_GEN=$PWD/generate_docs

# clone tone.js
TMP_TONE=$PWD/tmp/Tone.js
git clone https://github.com/Tonejs/Tone.js $TMP_TONE
cd $TMP_TONE

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

# sync the examples dir
cp -r $TMP_TONE/examples/ $PWD/examples/
git add ./examples
git commit -m 'updating to latest examples'

# and the build
cp -r $TMP_TONE/build/ $PWD/build/
git add ./build/
git commit -m 'updating to latest build'

cd $PWD
rm -rf $TMP_TONE
