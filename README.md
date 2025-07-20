# Dry Run Service

A backend API service building on top on the POC done in [dry-run-service-poc](https://github.com/LCYAD/dry-run-service-poc) using Hono, built to run on Bun, Deno, or Node.js.

## Features

- Health check endpoint at `/healthz`
- Cross-platform compatibility with runtime-specific optimizations
- TypeScript support
- Built with Hono framework

## Project Startup Files Structure

```
src/
  ├── app.ts        # Shared Hono application logic
  ├── bun.ts        # Bun-specific entry point
  ├── deno.ts       # Deno-specific entry point
  └── node.ts       # Node.js-specific entry point
```

## Prerequisites

- [Bun](https://bun.sh/) (recommended)
- Or [Node.js](https://nodejs.org/) (v18 or later)
- Or [Deno](https://deno.land/)
  - please note that you need to install latest version of Deno or it might not work. Tested in v2.2.3

## Installation

```bash
# Install dependencies using Bun (recommended)
bun install

# Or using npm
npm install

# Deno doesn't require installation
```

## Start up the database, redis and other services

```bash
docker compose up -d
```

## Running the Service

### Using Bun (Recommended)

```bash
# Development mode with hot reload
bun dev:bun

# Production mode
bun start:bun
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

### K6 Test

- Health Test

```bash
k6 run k6/healthz.test.js
```

- Json Test

```bash
k6 run k6/jobsJson.test.js
```

- Heavy Test

```bash
k6 run -e DUPLICATION_FACTOR={num of json in array} k6/heavy.test.js
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Things to note

- for `Deno`, remember to switch the commented line for importing `BullMQAdapter` in [`app.ts`](./src/app.ts) or else your app won't run
- for `Deno`, the import of other modules does not work inside the sandbox processors file so cannot utlize sandbox processor feature
- Bull board seems not be able to capture the proper state of jobs when adding concurrency options, more to be investgated.
- In `NodeJS` using the BullMQ's sandbox processors in the current way will result in the process not being able to kill itself after job's completion, creating unnecessary consumption of resources. Possible solution to explore:
  1. Test out solution proposed in this [post by adding process exit after job completion](https://www.alexanderlolis.com/riding-the-bull#removing-an-active-job-in-sandboxed-environments)
  2. Test out Worker Thread option
  3. create separate startup script for worker and launching them with separate resources
  4. implement the `worker.close()` function as stated [here](https://docs.bullmq.io/guide/workers/graceful-shutdown)
  - the above can be confirmed by using

```bash
ps -o pid,ppid,command | grep bullmq
```
