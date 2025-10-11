FROM openjdk:17-slim

WORKDIR /backend/authentication_manager

COPY /auth_service /backend/authentication_manager/QR_service

RUN mvn clean install -f /backend/authentication_manager/QR_service/pom.xml

EXPOSE 4001

CMD ["java", "-jar", "/backend/authentication_manager/QR_service/target/0.0.1.jar"]