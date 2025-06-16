# Base stage for shared configurations - avoid node:latest and go smaller
FROM node:24.2.0-alpine3.22 AS base
WORKDIR /usr/src/mvta
# Set correct permissions for the node user
RUN chown -R node:node /usr/src/mvta
ENV NODE_ENV=production
COPY package*.json ./
EXPOSE ${MVTA_PORT}

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
USER node
COPY ./server/ ./server/
COPY ./client/ ./client/
COPY ./data/ ./data/
COPY ./test/ ./test/
CMD [ "npm", "run", "dev" ]

# Test stage
FROM development AS test
ENV NODE_ENV=test
RUN npm install --only=development
CMD [ "npm", "test" ]

# Production dependencies stage
FROM base AS prod-deps
#RUN npm install --production --silent && mv node_modules ../  
RUN npm ci --omit=dev

# Production stage
FROM prod-deps AS production
USER node
COPY ./server/ ./server/
COPY ./client/ ./client/
COPY ./data/ ./data/
CMD ["node", "server/js/main.js"]