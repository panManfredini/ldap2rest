FROM node:15.3.0-buster
COPY package.json  app/
WORKDIR app
RUN yarn install --production
COPY index.js .
COPY src/* src/
CMD ["yarn","start"] 