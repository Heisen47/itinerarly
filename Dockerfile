# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Create non-root user early for security
RUN addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nextjs

# Copy package files
COPY package*.json ./

# Install dependencies with security flags
RUN npm ci --audit-level=moderate && \
    npm cache clean --force

# Copy TypeScript and Next.js config files first
COPY tsconfig.json ./
COPY next.config.* ./

# Copy source code (excluding sensitive files)
COPY --chown=nextjs:nodejs . .

# Remove .env.local from image for security (will be provided at runtime)
RUN rm -f .env.local

# Change ownership and switch to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Set NODE_ENV and security headers
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Create non-root user
# Create non-root user
RUN addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nextjs
# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install only production dependencies with security flags
RUN npm ci --only=production --audit-level=moderate && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/next.config.* ./
COPY --from=build --chown=nextjs:nodejs /app/package.json ./

# Switch to non-root user
USER nextjs

# Expose port (use non-privileged port)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]