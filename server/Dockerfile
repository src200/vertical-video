FROM node:10

# Create app directory
WORKDIR /app/server

# Copy the current directory contents into the container at /app
COPY . /app/server

# Install dependencies
RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]