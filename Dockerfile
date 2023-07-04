FROM node:18-alpine

COPY . .

RUN npm install
RUN npm run build

WORKDIR /server

ENV PORT=8080

RUN npm install
EXPOSE 8080:8080
CMD [ "npm", "run", "start" ]