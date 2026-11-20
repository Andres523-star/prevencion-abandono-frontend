# Imagen del frontend para Railway.
# Etapa 1: build de Vite. VITE_API_URL se fija en el build (Vite la incrusta en el JavaScript),
# por eso llega como argumento: en Railway, las variables del servicio se pasan como ARG.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "Falta la variable VITE_API_URL (URL del backend terminada en /api)" && exit 1)
RUN npm run build

# Etapa 2: Caddy sirve los archivos estáticos, con respaldo a index.html para las rutas del SPA.
FROM caddy:2.10-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
