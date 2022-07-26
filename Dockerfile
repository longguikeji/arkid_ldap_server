ARG BASEIMAGE=node:12-buster
FROM ${BASEIMAGE}
ENV BEURL=http://arkid-be
WORKDIR /usr/src/app
EXPOSE 1389
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]