FROM node:lts

WORKDIR route53ddns
COPY src/ .
RUN npm install
ENTRYPOINT node index.js