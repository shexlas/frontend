# --- Build stage: compile the Vite production bundle ---------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# VITE_* variables are baked into the JS bundle at build time, not read at
# container start - so this has to be a build ARG, not a runtime `environment:`
# entry (that was silently a no-op for `vite build` in the old dev-server setup).
# Defaults to an empty string, meaning "same origin" - the app then calls
# relative /api and /uploads paths, which nginx below proxies to the backend
# service. Override at build time only if the frontend and API are meant to
# be served from genuinely different origins.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- Runtime stage: serve the static build with nginx ---------------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
