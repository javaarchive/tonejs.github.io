#!/bin/bash

if [ "$TRAVIS" = "true" ]; then
	COMMIT_MESSAGE="- build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE"
else
	COMMIT_MESSAGE=""
fi