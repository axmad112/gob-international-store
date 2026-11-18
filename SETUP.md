# GOB Phase 1 setup

## Local setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to a PostgreSQL database you control and set a long random `AUTH_SECRET`.
4. Install dependencies with `npm install`.
5. Generate Prisma Client: `npm run db:generate`.
6. Validate the schema: `npm run db:validate`.
7. Create the first local migration: `npm run db:migrate -- --name init`.
8. Start the app: `npm run dev`.

## Quality checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test`

These commands are configured but have not been run by the repository connector. No database connectivity or migration success is claimed until credentials are supplied and commands are executed in CI or locally.

## Security

- Never commit `.env.local` or real secrets.
- Public registration must create customers only.
- Admin authorization must be enforced server-side.
- Payment gateways and AliExpress importing are disabled in Phase 1.
- The schema supports store boundaries for later multi-vendor expansion, but public seller registration is not enabled.
