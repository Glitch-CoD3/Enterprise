FROM node:22-alpine AS build

WORKDIR /app

ARG PORTFOLIO_BASE_PATH=/portfolio/
ENV PORTFOLIO_BASE_PATH=$PORTFOLIO_BASE_PATH

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html/portfolio
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 80

CMD ["sh", "/docker-entrypoint.sh"]