# Dry Run Service

A cross-platform compatible API service using Hono, built to run on Bun, Deno, or Node.js.

## Features

- Health check endpoint at `/healthz`
- Cross-platform compatibility
- TypeScript support
- Built with Hono framework

## Prerequisites

- [Bun](https://bun.sh/) (recommended)
- Or [Node.js](https://nodejs.org/) (v18 or later)
- Or [Deno](https://deno.land/)

## Installation

```bash
# Install dependencies using Bun (recommended)
bun install

# Or using deno
deno install

# Or using npm
npm install
```

## Running the Service

### Using Bun (Recommended)
```bash
# Development mode with hot reload
bun dev

# Production mode
bun start
```

### Using Deno
```bash
# Development mode with hot reload
deno task dev

# Production mode
deno task start
```

### Using Node.js
```bash
# Development mode with hot reload
npm run dev:node

# Production mode
npm run start:node
```

## Testing the API

Test the health check endpoint:
```bash
curl http://localhost:3000/healthz
```

## Environment Variables

- `PORT`: Server port (default: 3000)
