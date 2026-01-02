# Use Node.js 20 Alpine (LTS version that supports RSA_PKCS1_PADDING with security revert flag)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files first (for better caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY server.js ./
COPY public ./public
COPY src ./src

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application with security revert flag passed directly to node
CMD ["node", "--security-revert=CVE-2023-46809", "server.js"]
