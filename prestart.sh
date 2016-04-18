#!/bin/bash

# Installs roleTerminal configuration module
npm install $CONFIGPATH --save

mkdir -p ./public/scripts ./public/views ./public/styles ./public/sounds

# Copies required JS files to public, such as socket.io
cp ./private/required/* ./public/scripts
# cp ./private/sounds/* ./public/sounds

# Browserifies all JS to a bundle, minifies it and moves it to public
./node_modules/browserify/bin/cmd.js ./private/scripts/* -t [ babelify --presets [ es2015 ] --compact="false" ] | ./node_modules/uglify-js/bin/uglifyjs --compress --mangle -- > ./public/scripts/feed.js

# Compiles and compresses sass to css and moves them to public
for file in ./private/styles/*
do
  ./node_modules/node-sass/bin/node-sass --output-style=compressed "$file" -o ./public/styles
done

# Compresses HTML files and moves them to public
for file in ./private/views/*
do
  ./node_modules/html-minifier/cli.js --remove-comments --collapse-whitespace "$file" -o ./public/views/$(basename "$file")
done