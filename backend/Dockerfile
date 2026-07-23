# Etapa 1: Construcción (Maven)
FROM maven:3.8.8-eclipse-temurin-17-alpine AS build
WORKDIR /app
# Crear directorios ficticios para evitar que falle el plugin de frontend en entornos contenerizados
RUN mkdir -p /frontend/dist

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -Dfrontend.skip=true -B

# Etapa 2: Ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss256k", "-XX:MaxRAMPercentage=70.0", "-jar", "app.jar"]