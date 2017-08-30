#!/bin/bash

# install jsdocs
npm install -g jsdoc

# run the jsdocs
sh jsdoc.sh $1/Tone $2

# add and push the changes
git add ../_data
git commit -m 'updated data'
git add ../_documentation
git commit -m 'updated documentation'

git push -f
