FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install babel-cli
RUN npm install babel-preset-env -D
# COPY . .
EXPOSE 1389
CMD ["npm", "start"]