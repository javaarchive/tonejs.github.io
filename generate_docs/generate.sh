#!/bin/bash

# run the jsdocs
sh jsdoc.sh $1/Tone $2

if [ "$TRAVIS" = "true" ]; then
	COMMIT_MESSAGE="- build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE"
else
	COMMIT_MESSAGE=""
fi

# add and push the changes
git add ../_data
git commit -m "update data $COMMIT_MESSAGE" -m "Automated commit"
git add ../_documentation
git commit -m "update documentation $COMMIT_MESSAGE" -m "Automated commit"

# git push -f
