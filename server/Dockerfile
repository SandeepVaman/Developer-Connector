FROM node:9.6.1

#Create app directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

#Install app dependencies 
COPY package.json /usr/src/app/package.json

RUN npm install --silent

EXPOSE 8080
CMD ["npm", "start"]

