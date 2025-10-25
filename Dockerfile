# build stage
FROM node:24.3 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# runtime stage
FROM node:24.3-alpine as runner
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/package*.json ./
RUN npm install --production
CMD [ "npm", "start" ]