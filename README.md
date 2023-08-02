# Test-NodeJS
## Microservices Project

This is a simple microservices project consisting of two services: `m1` and `m2`. The services are built using Node.js and communicate with each other through RabbitMQ.

## Prerequisites

- Docker and Docker Compose should be installed on your machine.

## Getting Started

1. Clone the repository:

git clone https://github.com/AbdullaYerezhep/Test-NodeJS.git
cd project-directory


2. Build the Docker images and start the containers:

`make build`
`make up`

3. Check the logs to ensure everything is running:

`make logs`


4. Test the `m1` service with a POST request:

`make test`


## Service Details

### `m1`

- This service accepts POST requests on port 5001.
- It sends tasks to `m2` through RabbitMQ.
- It receives responses from `m2` through RabbitMQ.
- The Docker image for `m1` is built using the `Dockerfile` inside the `microservice-M1` directory.

### `m2`

- This service listens for tasks from `m1` through RabbitMQ.
- It processes the tasks and sends back responses through RabbitMQ.
- The Docker image for `m2` is built using the `Dockerfile` inside the `microservice-M2` directory.

## Stopping the Services

To stop and remove the containers, use:

`make down`

