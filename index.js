/**
 * New-device login link.
 *
 * The process launch token already exists in the connection layer
 * (`authenticatedUrl`); this plugin only exposes it to the owner-only settings
 * surface. The route sits under `/api/` so the shipped Host/Origin fence and
 * browser-cookie authentication apply unchanged.
 */
export const name = 'device-link'
export const inject = ['connection', 'webApp']

const ROUTE = '/api/dsh/device-link'

export function apply(ctx) {
  async function serve() {
    const advertised = ctx.webApp.getAdvertisedUrl()
    return Response.json(
      { url: ctx.connection.authenticatedUrl(advertised) },
      { headers: { 'cache-control': 'no-store' } },
    )
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
