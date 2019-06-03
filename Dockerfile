FROM node:10-alpine

WORKDIR /application

COPY package.json package-lock.json /application/
RUN npm install --only production

ADD artifact.tar.gz /application

CMD [ "node", "index.js" ]
