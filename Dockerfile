# build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# runtime stage
FROM node:18-alpine as runner
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/package*.json ./
RUN npm install --production
CMD [ "npm", "start" ]