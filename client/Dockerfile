FROM node:10

# Create app directory
WORKDIR /app/client

# Copy the current directory contents into the container at /app
COPY . /app/client

# Install dependencies
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]