# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:18 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY ./ /app/
ARG configuration=production
RUN npm run build -- --output-path=./dist --configuration $configuration
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
COPY --from=build-stage /app/dist /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the default nginx.conf provided by tiangolo/node-frontend
#COPY --from=build-stage /nginx.conf /etc/nginx/conf.d/default.conf
