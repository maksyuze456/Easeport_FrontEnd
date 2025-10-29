# build stage
FROM node:20-alpine as build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN echo "========================================="
RUN echo "Building with NEXT_PUBLIC_API_URL: '$NEXT_PUBLIC_API_URL'"
RUN echo "========================================="


COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# runtime stage
FROM node:20-alpine as runner
WORKDIR /app
COPY --from=build /app/.next .next
COPY --from=build /app/package*.json ./
RUN npm install --production
CMD [ "npm", "start" ]