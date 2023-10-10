# build
FROM node:18.18 AS builder

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
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf.template
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/entrypoint.sh /entrypoint.sh

# Make our entrypoint script executable
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
