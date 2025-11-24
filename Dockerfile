# --- Stage 1: Build the app ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

# Copy all project files
COPY . .

# Build production files
RUN npm run build



# --- Stage 2: Serve with a lightweight web server ---
FROM nginx:alpine

# Copy build output from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
