#!/bin/bash

configSize=${#CONFIGPATH}

# Installs config from external source, if CONFIGPATH is set
if (($configSize > 0)); then
  wget $CONFIGPATH/appConfig.js -O ./config/modified/appConfig.js
  wget $CONFIGPATH/databasePopulation.js -O ./config/modified/databasePopulation.js
fi

mkdir -p ./public/scripts ./public/views ./public/styles ./public/sounds

# Copies required JS files to public, such as socket.io
cp ./private/required/* ./public/scripts

echo "Browserifying and compressing JS, compiling and compressing SASS to CSS, compressing and moving view files"

# Browserifies all JS to a bundle, minifies it and moves it to public
browserify ./private/scripts/* -t [ babelify --presets [ es2015 ] --compact='false' ] | uglifyjs --compress --mangle -- > ./public/scripts/bundle.js

# Compiles and compresses sass to css and moves them to public
for file in ./private/styles/*
do
  node-sass --output-style=compressed "$file" -o ./public/styles
done

# Compresses HTML files and moves them to public
for file in ./private/views/*
do
  html-minifier --remove-comments --collapse-whitespace "$file" -o ./public/views/$(basename "$file")
done
