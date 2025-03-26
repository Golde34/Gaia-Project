FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /backend/auth_service/

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package -DskipTests

FROM openjdk:17-jdk-slim

WORKDIR /backend/auth_service/

COPY --from=build /backend/auth_service/target/auth_service-0.0.1.jar auth_service.jar

COPY src/main/resources/application-docker.properties application.properties

EXPOSE 4001

ENTRYPOINT ["java", "-jar", "auth_service.jar", "--spring.config.location=file:/backend/auth_service/application.properties"]

