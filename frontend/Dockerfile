# Build stage: compile the React application
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL


RUN npm run build


# Runtime stage: serve only the compiled application
FROM nginxinc/nginx-unprivileged:alpine3.24 AS runtime

USER root

# Apply available Alpine security updates
RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/build /usr/share/nginx/html

# Run NGINX without root privileges
USER 101

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]