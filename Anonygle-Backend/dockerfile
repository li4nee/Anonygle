FROM node:23-alpine3.20

WORKDIR /app

# only the package.json is copied to leverage the docker cache
COPY package.json .

RUN yarn install

# copy the rest of the files
COPY . .

RUN yarn build

EXPOSE 4000

# clean the node_modules to reduce the image size
RUN rm -rf  node_modules  

# install only the production dependencies
RUN yarn install --production 

CMD [ "node", "dist/main" ]