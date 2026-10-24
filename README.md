# identiVerse

Enterprise IAM consultancy website for **identiVerse**, **Bangalore, India**. Next.js App Router, strict TypeScript, React, Tailwind, shadcn-style Radix primitives, Lucide, Motion, React Hook Form, Zod, Tiptap, PostgreSQL, Prisma and Auth.js.

## Run locally

Requires Node.js 22.12+ (tested with Node 24).

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Without environment configuration, the public website uses the editable seed content in `src/lib/catalog.ts`; the consultation endpoint explicitly reports unavailability and administrator writes are disabled. No form submission is presented as successfully delivered without persistence.

## Connect the backend

Copy `.env.example` to `.env`, then supply a PostgreSQL `DATABASE_URL`. Do not commit `.env`.

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seeding preserves existing content. Published records override the seed catalogue; a stored draft removes that route from public listings. For an existing page, saving as draft **unpublishes it**. A slug change creates another record; unpublish the old path separately if retiring it. New technologies and pages appear in their section and navigation automatically.

### Administrator authentication

1. Create a **single-tenant** Microsoft Entra application. Register `https://YOUR_DOMAIN/api/auth/callback/microsoft-entra-id` as a web redirect URI (and the localhost equivalent for local development).
2. Set `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, and `AUTH_MICROSOFT_ENTRA_ID_ISSUER` to `https://login.microsoftonline.com/TENANT_GUID/v2.0`.
3. Generate a strong `AUTH_SECRET` using a secret manager or `npx auth secret`. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the exact canonical origin.
4. Provision an administrator using their **Entra user object ID**, not an email address:

```powershell
npm run admin:create -- "00000000-0000-0000-0000-000000000000" "Administrator name" ADMIN
```

Use `EDITOR` for content editors. Set `active=false` in the Admin database record to revoke access. Every protected read/write rechecks the current database role, including for existing sessions. Editors can manage pages, images and enquiries. Only ADMIN users can change company settings or read audit logs. Enforce phishing-resistant MFA and Conditional Access on the Entra application. There is no shared password, default user or local authentication bypass.

Visit `/admin`. Configure the company name, logo, tagline, location, contact information and LinkedIn URL there. Unknown email/phone values are intentionally empty. The CMS supports SEO fields, rich text, FAQs, capabilities, platforms and publication state.

### Troubleshoot administrator sign-in

Run `npm run auth:diagnose` to check which environment file supplies each setting, whether `.env.local` or inherited shell variables override `.env`, issuer format and origin agreement. Values of secrets and connection strings are never printed. This checks a new process; restart a running Next.js server to load changed configuration.

Development logs are enabled by default. Set `AUTH_DIAGNOSTICS=true` to enable them explicitly, including temporarily in production; set it to `false` to disable verbose logs. Restart Next.js and retry one fresh sign-in. Filter server output for `[admin-auth]`:

- `configuration`: client ID, issuer, callback URL and secret-presence/length checks, with no secret value.
- `provider.request` / `provider.response`: discovery/token endpoint, HTTP status, duration and credential-field presence. Token authentication explicitly uses `client_secret_post`.
- `token.rejected`: Microsoft's allowlisted OAuth error, AADSTS code, numeric error codes, trace ID and correlation ID. Free-form response text and token values are excluded.
- `authorization.claims`: presence of the object-ID claim and whether the tenant matches, without dumping the user profile.
- `authorization.admin_lookup`: whether the database user exists, is active and has an authorized role.
- `authorization.database_error`: sanitized database/network error classification.

Each incoming request has an attempt ID for grouping its events. The initial sign-in action and callback are separate requests. Never enable raw Auth.js debug metadata for troubleshooting: it may include PKCE verifiers, token responses and sensitive request data. Share the sanitized `[admin-auth]` lines rather than the callback URL, which contains an authorization code. These diagnostics do not prove credentials are accepted; an actual Entra login is needed to confirm that.

### Contact requests

Set a random `RATE_LIMIT_SALT`. Requests use Zod validation, same-origin checks, a honeypot, minimum completion time, explicit consent and a database-backed limit of five requests per ten-minute IP bucket. On Vercel the trusted Vercel forwarding header supplies the client IP; local/non-Vercel deployments share one bucket and must adapt this to their trusted proxy. Expired limit rows are pruned on requests. Add platform firewall controls for broader volumetric abuse protection.

Enquiries are saved to PostgreSQL before a success response. For notifications, set `RESEND_API_KEY`, `CONTACT_FROM` (a verified sender) and `CONTACT_TO`. Email failures remain visible in the enquiry’s emailStatus. The database is the source of truth; failed notifications do not delete submissions. Delivery is not retried automatically. Configure your retention process for enquiries, audit events and provider logs before public launch.

### Image library

Connect a **public Vercel Blob store** and supply `BLOB_READ_WRITE_TOKEN`. Uploads require an authorized role, verify MIME and file signatures, allow PNG/JPEG/WebP and limit files to 4 MB. SVG and executable uploads are rejected. Images use random server-generated paths; only public marketing assets belong here. Copy the resulting URL into the logo setting. Images can be inspected in the media library. Object deletion/retention is managed in the storage provider.

## Production deployment — Vercel / Node.js

Runtime PostgreSQL URLs default to `connection_limit=1&pool_timeout=20` unless those parameters are explicitly configured. The Prisma client is reused per process in both production and development. This limits each instance's pool; it does not cap the total connections across Vercel instances. For sustained concurrency, use the database provider's shared pooler. On Aiven, use the actual PgBouncer connection URI from Connect → Connection pools if your plan supports it; do not guess the pool port or database name. Use a direct connection for migrations. An already exhausted database may need idle clients closed before a new deployment can connect. Do not disconnect Prisma after each request or hide failed database reads with seed content, which could expose unpublished pages.

The selected target is **Vercel**, explicitly supported by the brief. This application uses a Node.js runtime and Prisma’s PostgreSQL client; it is **not** packaged as a Cloudflare Worker. A Worker deployment needs a tested compatible adapter, HTTP-compatible database driver and storage configuration. A static export would lose the CMS, authentication and enquiry APIs.

1. Import this directory as a Next.js project in Vercel.
2. Connect managed PostgreSQL (use a provider connection pool URL for serverless workloads) and public Blob storage.
3. Set all required environment variables in Vercel. Use HTTPS canonical values for `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`. Never expose secrets with `NEXT_PUBLIC_` prefixes.
4. Apply database migrations and seed against the production database in a controlled deployment step.
5. Build with `npm run build`; start with `npm start` for non-Vercel Node hosting.
6. Configure Entra redirect URIs, provision the administrator and verify sign-in, publishing, a real form submission and email delivery using your configured providers.

Production provider integration cannot be verified without the database and account credentials. The source can build and the public site can be previewed without them. Do not treat a local build as evidence that external services or public hosting are configured.

## Checks

```powershell
npm test
npm run typecheck
npm run build
npm audit
```

The tests exercise CMS record validation, contact consent/abuse fields, path constraints, rich-text XSS sanitization and streamed request size limits. TypeScript and the production build cover all routes. The lockfile is included in the delivered source. `deepmerge-ts` and nested Zod are pinned through overrides to patched versions; rerun generation, migration validation and tests when upgrading Prisma. Run `npm run test:smoke` against a running local server for HTTP route and authorization checks.

## Content and design

- Original navy, blue and cyan identity, animated SVG identity network and responsive layouts. Respects reduced motion and uses keyboard-operable navigation, visible focus and labeled forms.
- 11 services, 9 solutions, 10 technology pages, 12 industries, 10 compliance pages and 3 original engineering notes.
- Searchable, filterable compliance table linking to authoritative sources. It distinguishes regulations, standards, assurance and technical protocols. Technical mappings are illustrative and do not guarantee compliance.
- No invented customers, certifications, partnerships, awards, service levels, company metrics or testimonials. Case studies and testimonials are omitted from the homepage until approved material exists.
- The supplied attachment ends during phase 3 of the delivery methodology; the fourth phase is an original “Operate & evolve” continuation.
- Sitemap, robots, per-page metadata, organization/service structured data, generated social card and favicon are included. Public launch requires a real canonical domain.
- Essential cookies and a local privacy preference only. No optional analytics or advertising scripts. Privacy/terms copy should be completed against the company’s actual provider, legal-entity and retention details before public launch.

## Reference review

Information architecture was reviewed from [iC Consult](https://ic-consult.com/en/), [IDMWORKS](https://www.idmworks.com/) and [Simeio](https://simeio.com/). The ProofID page was inaccessible during review. The two additional HTML reference files named inside the brief were not attached. No source, proprietary copy or company claims were copied. All brand assets are original code-based graphics; technology names are text, not claimed partner logos.

Control mapping references: [EU GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html), [PCI SSC](https://www.pcisecuritystandards.org/standards/pci-dss/), [ISO 27001](https://www.iso.org/standard/27001), [NIST SP 800-53](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final), [EU DORA](https://eur-lex.europa.eu/eli/reg/2022/2554/oj).
