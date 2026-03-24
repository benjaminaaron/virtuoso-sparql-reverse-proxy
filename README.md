# virtuoso-sparql-reverse-proxy
A reverse proxy (using a cloudflare worker) to talk linked data with a virtuoso instance.

I built this for my Linked Open Data workshop at the Open Data Day München 2026. Originally in the [lod-starter-kit](https://github.com/benjaminaaron/lod-starter-kit) repo, I moved it to this separate repo.

## Setup

```sh
npm install
```

Use wrangler to deploy the worker - requires a cloudflare account.

```sh
npx wrangler login
npx wrangler deploy
npx wrangler secret put VIRTUOSO_USER
npx wrangler secret put VIRTUOSO_PASSWORD
```
