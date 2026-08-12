# Stage 1: Build & Dependency Caching
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml to download dependencies. This isolates dependency loading from source changes.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy only the backend source code directory (ignoring frontend folder completely)
COPY src ./src

# Compile and package the Java Spring Boot application into a executable .jar
RUN mvn clean package -DskipTests

# Stage 2: Minimalist Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy only the compiled .jar artifact from the build container
COPY --from=build /app/target/*.jar app.jar

# Spring Boot default API execution port
EXPOSE 8080

# Execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]
