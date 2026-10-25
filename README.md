# dsh-plugin-device-link

Generate a tokenized login link for a new device directly from DSH Settings — no SSH or terminal needed.

## What it does

Adds a **"New Device Login"** row to **Settings → General**. Click "Generate Link", and the plugin returns a fully-authenticated URL you can copy and open on any phone or tablet in your local network — no more digging through service logs.

![Settings row screenshot](assets/settings-row.png)

## Install

```bash
dsh plugin add dsh-plugin-device-link
```

Then refresh the browser — the row appears automatically in Settings → General.

## How it works

- The plugin registers a `GET /api/dsh/device-link` route that sits behind DSH's existing cookie auth and Host/Origin fence. Only a logged-in browser can call it.
- It reads the process-level launch token (generated once at startup via `crypto.randomBytes(32)`) and appends it as `?token=…` to the public URL configured at startup (`--public-url`).
- The link is valid until the DSH process restarts (at which point a new token is issued).

## Security notes

- The link carries a token equivalent to full owner access. Do not share it with others.
- Service restart invalidates the link immediately — regenerate it after a restart.

## Compatibility

| DSH version | Supported |
|---|---|
| `>=0.2.1-rc.1 <0.3.0-0` | ✅ |

## License

MIT
