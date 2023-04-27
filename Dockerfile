# build
FROM node:14 AS builder

WORKDIR /app

COPY package.json ./

RUN yarn --network-timeout 100000

COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig.json tsconfig.json

RUN yarn build

# deployment
FROM nginx:1.19-alpine AS deployment

COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

CMD nginx -g 'daemon off;'
