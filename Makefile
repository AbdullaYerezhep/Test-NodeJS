# Define the default target to be executed when 'make' is called without any arguments.
default: help

# Build Docker images for m1 and m2
build:
	docker-compose build

# Start the containers
up:
	docker-compose up

# Stop and remove the containers
down:
	docker-compose down --rmi all -v --remove-orphans

# Show the container logs
logs:
	docker-compose logs -f

# Test m1 with a POST request containing {email: "example@gmail.com"}
test:
	curl -X POST -H "Content-Type: application/json" -d '{"task":"Hard Task"}' http://localhost:5001/send

# Help target to display available targets
help:
	@echo "Available targets:"
	@echo "  build     Build Docker images for m1 and m2"
	@echo "  up        Start the containers"
	@echo "  down      Stop and remove the containers"
	@echo "  logs      Show the container logs"
	@echo "  test      Test m1 with a POST request containing {email: 'example@gmail.com'}"
	@echo "  help      Display this help message"
