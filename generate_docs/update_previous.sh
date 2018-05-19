SITE_DIR=$(pwd)
DOC_GEN=$SITE_DIR

# clone tone.js
TMP_TONE=$SITE_DIR/tmp/Tone.js
git clone https://github.com/Tonejs/Tone.js $TMP_TONE

VERSIONS=( r6 r7 r8 r9 r10 )

for tag in "${VERSIONS[@]}"

do :
	# get the tag
	cd $TMP_TONE
	git checkout tags/$tag

	cd $DOC_GEN
	sh generate.sh $TMP_TONE
done

rm -rf $TMP_TONE
