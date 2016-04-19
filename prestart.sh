#!/bin/bash

# Installs roleTerminal configuration module
npm install $CONFIGPATH

mkdir -p ./public/scripts ./public/views ./public/styles ./public/sounds

# Copies required JS files to public, such as socket.io
cp ./private/required/* ./public/scripts

echo "Browserifying and compressing JS, compiling and compressing SASS to CSS, compressing and moving view files"

# Browserifies all JS to a bundle, minifies it and moves it to public
./node_modules/browserify/bin/cmd.js ./private/scripts/* -t [ babelify --presets [ es2015 ] --compact='false' ] | ./node_modules/uglify-js/bin/uglifyjs --compress --mangle -- > ./public/scripts/bundle.js

# Compiles and compresses sass to css and moves them to public
for file in ./private/styles/*
do
  ./node_modules/node-sass/bin/node-sass -o ./public/styles "$file" --output-style=compressed
done

# Compresses HTML files and moves them to public
for file in ./private/views/*
do
  ./node_modules/html-minifier/cli.js -o ./public/views/$(basename '$file') "$file" --remove-comments --collapse-whitespace
done
