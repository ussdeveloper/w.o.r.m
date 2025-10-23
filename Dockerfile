# WORM Universal Language Interface
# Multi-stage Docker build

# Stage 1: Build environment
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    gcc \
    g++ \
    make \
    musl-dev \
    go

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build WORM binary for Linux
RUN npm run build:linux

# Stage 2: Runtime environment
FROM alpine:latest AS runtime

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    python3 \
    py3-pip \
    go \
    gcc \
    g++ \
    musl-dev

# Install Python packages
RUN pip3 install numpy pandas scikit-learn

# Create app user
RUN addgroup -g 1000 worm && \
    adduser -D -s /bin/sh -u 1000 -G worm worm

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/dist/worm-linux ./worm
COPY --from=builder /app/dist/worm-linux-packaged/ ./

# Set permissions
RUN chmod +x ./worm && \
    chown -R worm:worm /app

# Switch to app user
USER worm

# Expose port for potential web interface
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ./worm version || exit 1

# Default command
CMD ["./worm", "interactive"]

# Labels
LABEL org.opencontainers.image.title="WORM Universal Language Interface"
LABEL org.opencontainers.image.description="Universal programming language interface"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="WORM Team"