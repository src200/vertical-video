## Prerequesites
Install Docker locally

### Run client
cd to client folder

``docker build --tag=client .``

``docker run -p 3000:3000 client``

### Run server
cd to server folder

``docker build --tag=server .``

``docker run -p 8080:8080 server``

### Run both using docker-compose
``docker-compose up``