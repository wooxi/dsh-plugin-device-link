/**
 * New-device login links.
 *
 * The process launch token already exists in the connection layer
 * (`authenticatedUrl`); this plugin only exposes it to the owner-only surface
 * that asks for it. The route sits under `/api/` so the shipped Host/Origin
 * fence and browser-cookie authentication apply unchanged.
 *
 * Two reachable roots are candidates for a *new* device:
 *   - `public` — the advertised URL (`--public-url`, else the bind origin).
 *   - `lan`    — the bind origin, offered only when it is not loopback,
 *                because `127.0.0.1` means nothing to a phone.
 * Either may be absent; the browser picks from what it receives.
 */
export const name = 'device-link'
export const inject = ['connection', 'webApp', 'webServer']

const ROUTE = '/api/dsh/device-link'

/** Loopback origins cannot reach a second device, so they never earn a candidate row. */
function isLoopback(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    /^127\./.test(hostname) ||
    /^::ffff:127\./i.test(hostname)
  )
}

export function apply(ctx) {
  async function serve() {
    const links = []
    const seen = new Set()

    const push = (id, base) => {
      let url
      try {
        url = ctx.connection.authenticatedUrl(base)
      } catch {
        return
      }
      const origin = new URL(url).origin
      if (seen.has(origin)) return
      seen.add(origin)
      links.push({ id, url, origin })
    }

    // The advertised root: `--public-url` when configured, else the bind origin.
    try {
      const advertised = ctx.webApp.getAdvertisedUrl()
      const hostname = new URL(advertised).hostname
      push(isLoopback(hostname) ? 'local' : 'public', advertised)
    } catch {
      // No Web runtime on this composition; the other candidate may still exist.
    }

    // The bind origin, useful when the deployment serves plain HTTP on a LAN.
    try {
      const bindOrigin = ctx.webServer.getOrigin()
      if (!isLoopback(new URL(bindOrigin).hostname)) push('lan', bindOrigin)
    } catch {
      // `webServer` absent, or not listening yet: a candidate is optional.
    }

    return Response.json({ links }, { headers: { 'cache-control': 'no-store' } })
  }

  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: ROUTE,
        methods: ['GET'],
        requestBody: 'buffered',
        fetch: serve,
      }),
    'device-link: /api/dsh/device-link',
  )
}
