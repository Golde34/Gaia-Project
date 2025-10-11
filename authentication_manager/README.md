# Authentication Service - Getting Started

## Overview

The Authentication Service is a Java-based microservice in the Gaia system, built using Java 17. It handles user authentication and authorization, ensuring secure access to the Gaia ecosystem. This service manages user credentials, token generation, validation, and logout operations, providing a robust security layer for the platform.

---

## Requirements

- Java 17+
- Maven 3.6+
- A configured database for storing user credentials
- Environment variables for JWT secret and database connection

---

## Available Commands

In the project directory, you can run:

### `mvn clean install`

Builds the project and installs all dependencies.

### `mvn spring-boot:run`

Runs the service in development mode. The application will start on the configured port.

---

## Development Workflow

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/Auth-Service.git
   cd Auth-Service
   ```

2. **Build the Project**:
   ```bash
   mvn clean install
   ```

3. **Run the Application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Run Tests**:
   ```bash
   mvn test
   ```

---

## Contributing

Contributions are welcome! Please create a pull request or raise an issue to suggest improvements.

---

The Authentication Service ensures secure access and user management in the Gaia system. Start building a secure application with Gaia today!

