ARG BASEIMAGE=node:12-buster
FROM ${BASEIMAGE}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 1389
CMD ["npm", "start"]
