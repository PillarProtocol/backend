FROM node:12.22.5-buster

RUN cd ~ && mkdir app

COPY package.json /home/app/package.json
COPY package-lock.json /home/app/package-lock.json
WORKDIR /home/app

RUN rm -rf node_modules
RUN npm install --save-dev
RUN npm audit fix
COPY . /home/app

CMD [ "npm", "start" ]