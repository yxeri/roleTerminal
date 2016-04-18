#!/bin/bash
# Copies required JS files to public, such as socket.io
cp private/required/* public/scripts
# Browserifies all JS to a bundle, minifies it and moves it to public
./node_modules/browserify/bin/cmd.js private/scripts/* -t [ babelify --presets [ es2015 ] --compact="false" ] | ./node_modules/uglify-js/bin/uglifyjs > public/scripts/feed.js