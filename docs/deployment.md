# Deployment

## Recommended Stack

- Cloudflare DNS
- VPS (Ubuntu)
- Docker + Docker Compose
- PostgreSQL container
- Next.js app container
- Caddy or Nginx reverse proxy
- GitHub Actions CI

## Steps

1. Buy domain and point to Cloudflare
2. Provision VPS, install Docker
3. Clone repo, create production `.env`
4. Run migration: `pnpm prisma migrate deploy`
5. Build app: `pnpm build`
6. Start with Docker Compose
7. Enable HTTPS via Caddy/Nginx
8. Test public flow, admin login, QR scan, Stripe webhook

## Environment Variables

See `.env.example` for all required variables.

## Backup

- Daily: database backup
- Weekly: full backup incl. images
- Store backups off-server
