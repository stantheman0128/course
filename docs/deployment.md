# Deployment

## Cloudflare Pages (Git integration)

One-time setup at https://dash.cloudflare.com:

1. Workers & Pages → Create → Pages → Connect to Git
2. Select repo `stantheman0128/course`
3. Production branch: `main`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Root directory: `/`
7. Save and Deploy

After first deploy succeeds, get a `<project>.pages.dev` URL.

## Custom domain: course.stan-shih.com

1. Pages project → Custom domains → Set up a custom domain
2. Enter `course.stan-shih.com`
3. Cloudflare auto-detects stan-shih.com zone and creates CNAME
4. Wait 30s–2min for SSL cert issuance
5. Verify: `https://course.stan-shih.com` serves the app

## Continuous deployment

- Push to `main` → auto build + deploy production
- Open PR → auto preview URL at `https://<hash>.course-xxx.pages.dev`

## Local wrangler

After Cloudflare zone is active:

```bash
npm install -g wrangler
wrangler login
wrangler whoami
```

Use `wrangler pages deployment list` and `wrangler pages deployment tail` for ops.

## Updating transcript next semester

1. Replace `docs/catalog-source/scoreExport.xls` with new export
2. `npm run sync:transcript`
3. `git commit src/data/transcript.json`
4. Push → auto-deploy
