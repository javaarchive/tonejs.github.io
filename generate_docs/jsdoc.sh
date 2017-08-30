#!/bin/bash

DATA_FILES=$(pwd)/../_data
DOC_FILES=$(pwd)/../_documentation

# collect all of the files
TONE_FILES=$(find $1 -type f )

JSDOC_OUTPUT=docs.json

# run jsdocs on all of it
jsdoc -X $TONE_FILES > $JSDOC_OUTPUT

# get the version number
VERSION=$(node version.js $JSDOC_OUTPUT)

if [ "${2}" = "dev" ]; then
	VERSION=dev
fi

# simplify the jsdoc file
node jsdoc_attributes.js $JSDOC_OUTPUT $DATA_FILES/$VERSION/

# generate all of the files
node jsdoc_generateFiles.js $VERSION $DOC_FILES

# make a type file
TYPE_FILE=$DOC_FILES/$VERSION/Type.md
echo "---" > $TYPE_FILE
echo "layout: type" >> $TYPE_FILE
echo "title: Type" >> $TYPE_FILE
echo "version: $VERSION" >> $TYPE_FILE
echo "---" >> $TYPE_FILE

# update the current version
if [ "${VERSION}" != "dev" ]; then
	echo $VERSION > $DATA_FILES/version.yaml
fi

rm $JSDOC_OUTPUT
