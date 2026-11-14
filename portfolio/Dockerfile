FROM node:20-alpine

WORKDIR /app

ARG PORTFOLIO_BASE_PATH=/portfolio/
ENV PORTFOLIO_BASE_PATH=$PORTFOLIO_BASE_PATH

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]