# dsh-plugin-device-link

A settings section that mints tokenized login links for new devices — pick a public or LAN entry point, copy, and log in from a phone without touching a terminal.

## What it does

Adds a **新设备登录 (New Device Login)** page to the **Settings** panel, in the same nav list as General / Models / Plugins. Open it to get a fully-authenticated URL you can paste into any phone or tablet browser.

Because it registers on the host's `settings.section` slot and builds its controls from host primitives (`Button`, `Input`, `SegmentedControl`, `Switch`), it inherits the active theme and typography — light or dark, and the same body font as every shipped settings page.

The section exposes the decisions that used to live in shell flags:

| Option | Why it matters |
|---|---|
| **Entry point** | When the server advertises a public domain *and* binds a LAN address, both links are offered. A phone on the same Wi-Fi usually wants the LAN one; a phone on mobile data needs the public one. |
| **Reveal token** | The link is masked by default so it can be shown on screen or in a screenshot without leaking the token. |
| **Remembered choice** | The last entry point and reveal setting persist in `localStorage`. |

The entry picker (a segmented control) only appears when more than one reachable root exists — a loopback-only deployment shows just the single link.

## Install

```bash
dsh plugin add dsh-plugin-device-link
```

Reload the browser afterwards: the section appears in Settings once the plugin loads.

## How it works

- `GET /api/dsh/device-link` returns every reachable entry as `{ links: [{ id, url, origin }] }`. It sits behind DSH's existing cookie auth and Host/Origin fence, so only a logged-in browser can call it.
- Each URL is the process launch token appended as `?token=…` to a root the server actually serves:
  - `public` — the advertised URL (`--public-url`, else the bind origin)
  - `lan` — the bind origin, only when it is not loopback
  - `local` — a loopback origin, offered alone when nothing wider is reachable
- Duplicate origins collapse into one row, so a deployment with no `--public-url` shows a single link rather than the same address twice.
- The token is process-scoped: a restart invalidates every previously generated link.

## Security notes

- The link carries a token equivalent to full owner access. Do not share it with others.
- The section masks the token by default; "显示完整令牌" reveals it for copying by hand.
- A restart invalidates the link immediately — regenerate it afterwards.

## Compatibility

| DSH version | Supported |
|---|---|
| `>=0.2.1-rc.1 <0.3.0-0` | ✅ |

## License

MIT
