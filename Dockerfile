FROM node:7.0.0
EXPOSE 8888
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# wget is used to retrieve config file in prestart
RUN apt-get update && apt-get -y install wget && rm -rf /var/lib/apt/lists/*
COPY package.json /usr/src/app/
RUN npm install

# Creates directories for scripts, views and styles in public
RUN mkdir -p /usr/src/app/public/scripts /usr/src/app/public/views /usr/src/app/public/styles
# Creates directories for sounds and images
RUN mkdir -p /usr/src/app/public/sounds /usr/src/app/public/images

# Copies required JS files to public, such as socket.io
COPY private/required/ /usr/src/app/public/scripts/
# Copies images to public
COPY private/images/ /usr/src/app/public/images/

COPY . /usr/src/app

# Transpiles code to es5 and outputs it to public
RUN ./node_modules/browserify/bin/cmd.js private/scripts/* -t [ babelify --presets [ es2015 ] --compact='false' ] -o /usr/src/app/public/scripts/bundle.js
# Minifies transpiled code and outputs it to public
RUN ./node_modules/uglify-js/bin/uglifyjs --compress --mangle --output /usr/src/app/public/scripts/bundle.min.js -- /usr/src/app/public/scripts/bundle.js

# Retrieves external config and runs npm start
CMD [ "./docker-start.sh" ]
