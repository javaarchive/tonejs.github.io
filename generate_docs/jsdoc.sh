#!/bin/bash

DATA_FILES=$(pwd)/../_data
DOC_FILES=$(pwd)/../_documentation

# collect all of the files
TONE_FILES=$(find $1 -type f )

JSDOC_OUTPUT=docs.json

# run jsdocs on all of it
jsdoc -X $TONE_FILES > $JSDOC_OUTPUT

# get the version number
VERSION=$(node version.js)

if [ "${2}" = "dev" ]; then
	VERSION_DIR=dev
else
	VERSION_DIR=$VERSION
fi

echo "VERSION_DIR : $DATA_FILES/$VERSION_DIR/"

# simplify the jsdoc file
node jsdoc_attributes.js $JSDOC_OUTPUT $DATA_FILES/$VERSION_DIR/

# generate all of the files
node jsdoc_generateFiles.js $VERSION_DIR $DOC_FILES

if [ "$VERSION_DIR" == *"."* ]; then
	ESCAPED_VERSION="$(echo "$VERSION_DIR" | tr . _)"
	# remove if there's already a dir
	rm -rf $DATA_FILES/$ESCAPED_VERSION
	# copy to an escaped dir
	cp $DATA_FILES/$VERSION_DIR $DATA_FILES/$ESCAPED_VERSION
fi

# make a type file
TYPE_FILE=$DOC_FILES/$VERSION_DIR/Type.md
echo "---" > $TYPE_FILE
echo "layout: type" >> $TYPE_FILE
echo "title: Type" >> $TYPE_FILE
echo "version: $VERSION_DIR" >> $TYPE_FILE
echo "---" >> $TYPE_FILE

# update the current version
if [ "${VERSION_DIR}" != "dev" ]; then
	echo $VERSION_DIR > $DATA_FILES/version.yaml
fi

rm $JSDOC_OUTPUT
