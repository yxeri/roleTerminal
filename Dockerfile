FROM node:5.5.0
EXPOSE 8888
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# wget is used to retrieve config file in prestart
RUN apt-get update && apt-get -y install wget && rm -rf /var/lib/apt/lists/*
COPY package.json /usr/src/app/
RUN npm install

# Copies required JS files to public, such as socket.io
COPY private/required/ /usr/src/app/public/scripts/

# Copies images to public
COPY private/images/ /usr/src/app/public/images/

COPY . /usr/src/app

CMD [ "npm", "start" ]
