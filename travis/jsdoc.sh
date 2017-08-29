#!/usr/bin/env bash

# collect all of the files
TONE_FILES=$(find $PWD/tmp/Tone.js/Tone -type f )

JSDOC_OUTPUT=./tmp/docs.json

# run jsdocs on all of it
jsdoc -X $TONE_FILES > $JSDOC_OUTPUT

# get the version number
VERSION=$(node jsdoc_version.js $JSDOC_OUTPUT)

# simplify the jsdoc file
node jsdoc_attributes.js $JSDOC_OUTPUT ../_data/$VERSION/

# generate all of the files
node jsdoc_generateFiles.js $VERSION ../_documentation/

# make a type file
TYPE_FILE=../_documentation/$VERSION/Type.md
echo "---" > $TYPE_FILE
echo "layout: type" >> $TYPE_FILE
echo "title: Type" >> $TYPE_FILE
echo "version: $VERSION" >> $TYPE_FILE
echo "---" >> $TYPE_FILE
