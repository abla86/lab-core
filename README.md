# LAB CORE

Interactive architecture hub for the AB Engineering Lab ecosystem.

## Included

- Interactive LAB CORE frontend
- Node selection and routing visualization
- Live backend health state
- REST API for service information and registered labs
- Security response headers
- Secure static-file serving
- Production Docker image
- Hardened Docker Compose configuration
- Automated GitHub Actions verification

## Registered labs

- Game Lab
- Evidence Lab
- Security Lab
- Data Lab
- DevOps Lab
- Systems Lab

## Run locally

Requires Node.js 20 or newer.

    npm install
    npm start

Open http://localhost:3000.

## Verify

    npm run check

The check validates JavaScript syntax and executes the API integration tests.

## Run with Docker

    docker compose up --build

Open http://localhost:3000.

The container runs as the non-root node user with a read-only filesystem and a healthcheck against /api/health.

## API

| Endpoint | Purpose |
|---|---|
| GET /api/health | Runtime health |
| GET /api/info | Service metadata |
| GET /api/labs | Registered lab definitions |

## Configuration

- HOST: bind address; defaults to 0.0.0.0
- PORT: TCP port from 1 to 65535; defaults to 3000

## Architecture

LAB CORE is deliberately the stable hub layer. Individual domain implementations remain separate so new labs can be added without coupling their internal application logic to the hub.

The API and frontend communicate through same-origin requests, allowing the standalone application to be deployed as a single service and later placed behind Azure or Kubernetes infrastructure.

## CI

GitHub Actions verifies:

1. JavaScript syntax
2. API integration tests
3. Docker image build
4. Docker Compose configuration
