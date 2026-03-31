# Cloud Start Page

A private start page for self-hosted cloud services. Provides a clean dashboard to access all your services, with access control via Keycloak groups.

## Features

- Services organized in visual categories (icon + title)
- Access control: users only see services their Keycloak groups have access to
- Companion app links per service (mobile, desktop)
- Admin area: manage services, categories, icons, and access groups

## Tech Stack

- **Framework:** Nuxt 4 + Nuxt UI v4 + Tailwind CSS 4
- **Auth:** `nuxt-oidc-auth` + Keycloak (OIDC with group claims from JWT)
- **Database:** `better-sqlite3` + Drizzle ORM

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Database

Generate migrations:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

## Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Environment Variables

| Variable | Description |
|---|---|
| `NUXT_OIDC_*` | Keycloak OIDC configuration |
| `ADMIN_GROUP` | Keycloak group name with admin access |
