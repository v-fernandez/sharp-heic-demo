FROM node:21-alpine

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk add --no-cache build-base vips-dev vips-heif

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

EXPOSE 3000
EXPOSE 54321

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
