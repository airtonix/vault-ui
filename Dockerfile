FROM mhart/apline-node:5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
RUN npm run build

EXPOSE 8080 3030

CMD [ "npm", "run", "start" ]
