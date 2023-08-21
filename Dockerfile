# Base image
FROM node:18

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install --legacy-peer-deps
RUN npm i -g sequelize-cli@6.6.1
RUN npm -g install ts-node

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD npm run backend:run-migrations && npm run start
