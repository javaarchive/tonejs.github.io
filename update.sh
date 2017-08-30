#!/bin/bash

SITE_DIR=$(pwd)
DOC_GEN=$SITE_DIR/generate_docs

# clone tone.js
TMP_TONE=$SITE_DIR/tmp/Tone.js
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

echo dir: $TMP_TONE/examples/. $SITE_DIR/examples/

# sync the examples dir
cp -a $TMP_TONE/examples/. $SITE_DIR/examples/
git add ./examples
git commit -m 'updating to latest examples'

# and the build
cp -a $TMP_TONE/build/. $SITE_DIR/build/
git add ./build/
git commit -m 'updating to latest build'

cd $SITE_DIR
rm -rf $TMP_TONE
