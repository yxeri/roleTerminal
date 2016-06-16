#!/bin/bash

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

configSize=${#CONFIGPATH}

# Installs config from external source, if CONFIGPATH is set
if (($configSize > 0)); then
  mkdir ./config/modified
  wget $CONFIGPATH/appConfig.js -O ./config/modified/appConfig.js
  wget $CONFIGPATH/databasePopulation.js -O ./config/modified/databasePopulation.js
fi

npm start
