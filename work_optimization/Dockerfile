FROM maven:3.8.4-openjdk-17 AS build

WORKDIR /backend/work_optimization/

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package -DskipTests

FROM openjdk:17-jdk-slim

WORKDIR /backend/work_optimization/

COPY --from=build /backend/work_optimization/target/work_optimization-0.0.1.jar work_optimization.jar

COPY src/main/resources/application-docker.properties application.properties

EXPOSE 3001

ENTRYPOINT ["java", "-jar", "work_optimization.jar", "--spring.config.location=file:/backend/work_optimization/application.properties"]