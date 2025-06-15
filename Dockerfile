# Use official Node.js image
FROM node:latest

ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/mvta/

# Install dependencies
COPY package*.json ./
RUN npm install --production --silent && mv node_modules ../

# Copy
COPY ./data ./data
COPY ./client ./client
COPY ./server ./server

# Expose MVTA port
EXPOSE 1337

RUN chown -R node /usr/src/mvta

# Start MVTA
CMD ["node", "./server/js/main.js"]