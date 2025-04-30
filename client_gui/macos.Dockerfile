FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 build-base \
    && ln -sf python3 /usr/bin/python

COPY package.json package-lock.json ./

RUN npm install --no-optional

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]