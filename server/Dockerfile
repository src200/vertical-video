FROM node:10

# Create app directory
WORKDIR /app/server

# Bundle app source
COPY . /app/server

# Install dependencies
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

# RUN ffmpeg_install.sh

EXPOSE 8080
CMD [ "npm", "start" ]