# Logicore Velocity — Enterprise Architecture

## Overview
Logicore Velocity is an enterprise-grade, multi-tenant fleet, driver, operations, and finance management platform. It enforces a strict single-truth operational model via PostgreSQL, immutable audit ledgers, and deterministic state-machine workflows.

## Canonical Tech Stack
*   **Frontend**: React 19, React Router, Tailwind CSS, Recharts, Lucide Icons.
*   **Backend**: Node.js, Express, TypeScript.
*   **Database**: PostgreSQL (Cloud SQL), Drizzle ORM.
*   **Identity**: Firebase Authentication (Zero-trust KMS credential isolation).
*   **Intelligence**: Google Gemini 3.1 Pro (High Thinking Level) for predictive analytics and read-only NLP queries.
*   **External Integrations**: Google Workspace (Drive API) for Excel/CSV import pipelines.

## Architecture Guarantees
1.  **Strict Transactional Truth**: All state changes occur via PostgreSQL ACID transactions.
2.  **Auditability**: `audit_logs` table provides immutable, append-only provenance for all entities.
3.  **Role-Based Access**: Multi-tier RBAC (Super Admin, Ops, Finance) enforced via middleware and UI barriers.
4.  **AI Governance**: LLM capabilities are strictly confined to read-only analytical aggregations and predictive scoring (no autonomous mutations).

## Local Development
1.  **Prerequisites**: Node.js 20+, PostgreSQL instance.
2.  **Environment Setup**:
    *   Copy `.env.example` to `.env`
    *   Populate `DATABASE_URL` (PostgreSQL connection string)
    *   Ensure `firebase-applet-config.json` is present for Auth.
3.  **Database Migration**:
    ```bash
    npm run lint
    npx drizzle-kit push
    ```
4.  **Run Server**:
    ```bash
    npm run dev
    ```

## Deployment (Cloud Run + Cloud SQL)
1.  **Build**: The build pipeline compiles the React SPA and bundles the Express backend into a single `dist/server.cjs` artifact using `esbuild`.
    ```bash
    npm run build
    ```
2.  **Start**:
    ```bash
    npm run start
    ```
3.  **Provisioning**: Deploy via Google Cloud Run, binding the Cloud SQL connection via Unix Domain Sockets or VPC Serverless Connector. Pass environment variables via Google Secret Manager.
