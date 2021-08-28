FROM node:14-alpine

WORKDIR /application
EXPOSE 80

ADD artifact.tar.gz .
ADD package.json .
RUN npm install --only=production

CMD [ "node", "index.js" ]
