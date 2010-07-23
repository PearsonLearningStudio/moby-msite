#!/bin/bash
# Script for packaging the Moby mSite from the Production application in preparation for a push to github.  NOTE: this script is internal to Pearson eCollege and is not intended for external usage.

MOBY_URL=http://m.ecollege.com
OUT_SRC_DIR=./src/msite

mkdir $OUT_SRC_DIR

P4_USER=chrish
P4_PORT=perforce.dev.ecollege.com:1667
P4_CLIENT=moby-msite-github

p4 -c $P4_CLIENT -u $P4_USER -p $P4_PORT sync -f //moby-msite-github/... 

# Dynamically generated scripts (some server-side processing)
mkdir $OUT_SRC_DIR/scripts
mkdir $OUT_SRC_DIR/scripts/ThirdParty
mkdir $OUT_SRC_DIR/scripts/ValueObjects

curl $MOBY_URL/scripts/ServiceDomains.js >$OUT_SRC_DIR/scripts/ServiceDomains.js
curl $MOBY_URL/scripts/wmm.js >$OUT_SRC_DIR/scripts/wmm.js

