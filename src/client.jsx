import { useEffect, useMemo, useState } from 'react'

/**
 * New-device login links, as a standalone sidebar panel.
 *
 * The host API answers every reachable entry point at once, so switching
 * between "public domain" and "LAN address" is a local choice — no second
 * round trip, and one launch token for all of them.
 */

const PANEL_ID = 'device-link'
const STORE_ENTRY = 'dsh.device-link.entry'
const STORE_REVEAL = 'dsh.device-link.reveal'

/** Copy shown per candidate id; unknown ids fall back to a neutral label. */
const ENTRY_LABEL = {
  public: '公网',
  lan: '局域网',
  local: '本机',
}

const ENTRY_HINT = {
  public: '外网可访问，需域名解析正常',
  lan: '同一 Wi-Fi 下直连，速度更快',
  local: '仅本机可访问',
}

const PAGE = {
  height: '100%',
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '40px 24px 64px',
}

const COLUMN = { maxWidth: 720, margin: '0 auto' }

const HEADING = { margin: 0, fontSize: 20, lineHeight: '26px', fontWeight: 600 }
const LEAD = {
  margin: '8px 0 0',
  color: 'var(--dsw-alias-label-secondary)',
  fontSize: 13,
  lineHeight: '20px',
}

const SECTION = { marginTop: 32 }
const LEGEND = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--dsw-alias-label-secondary)',
  letterSpacing: '0.01em',
  marginBottom: 8,
}

const CHOICE_LIST = {
  border: '0.5px solid var(--dsw-alias-border-l2)',
  borderRadius: 10,
  overflow: 'hidden',
}

const choiceStyle = (selected, last) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 14px',
  cursor: 'pointer',
  background: selected ? 'var(--dsw-alias-bg-l2)' : 'transparent',
  borderBottom: last ? 'none' : '0.5px solid var(--dsw-alias-border-l2)',
})

const RADIO = { marginTop: 3, flex: 'none', cursor: 'pointer' }
const CHOICE_BODY = { minWidth: 0, flex: 1, display: 'block' }
const CHOICE_TITLE = { display: 'block', fontSize: 13, lineHeight: '18px' }

const CHOICE_ORIGIN = {
  display: 'block',
  marginTop: 2,
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--dsw-alias-label-secondary)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const CHOICE_HINT = {
  display: 'block',
  marginTop: 2,
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--dsw-alias-label-secondary)',
}

const LINK_BOX = { display: 'flex', alignItems: 'stretch', gap: 8, marginTop: 12 }

const INPUT = {
  flex: 1,
  minWidth: 0,
  padding: '8px 10px',
  fontSize: 12,
  lineHeight: '18px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  color: 'inherit',
  background: 'var(--dsw-alias-bg-base)',
  border: '0.5px solid var(--dsw-alias-border-l2)',
  borderRadius: 8,
}

const buttonStyle = (primary) => ({
  flex: 'none',
  padding: '8px 14px',
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: 8,
  border: primary ? 'none' : '0.5px solid var(--dsw-alias-border-l2)',
  color: primary ? '#fff' : 'inherit',
  background: primary ? 'var(--dsw-alias-accent, #3b6cf6)' : 'transparent',
})

const META_ROW = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  marginTop: 10,
  flexWrap: 'wrap',
}

const TOGGLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  color: 'var(--dsw-alias-label-secondary)',
  cursor: 'pointer',
}

const FOOTNOTE = {
  marginTop: 28,
  paddingTop: 20,
  borderTop: '0.5px solid var(--dsw-alias-border-l2)',
  fontSize: 12,
  lineHeight: '20px',
  color: 'var(--dsw-alias-label-secondary)',
}

const ERROR = { marginTop: 10, fontSize: 12, color: 'var(--dsw-alias-label-error, #d33)' }

function readStore(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private mode or a blocked store: the preference simply does not persist.
  }
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText !== undefined) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to execCommand (plain-HTTP origin, no clipboard permission).
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * Hide the launch token while keeping the rest of the URL readable.
 *
 * A regex rather than `URLSearchParams`: the latter percent-encodes the mask
 * itself into `%E2%80%A2…`, which is unreadable in a single-line field.
 */
function maskToken(url) {
  // The host mints the token as exactly `token=` (`TOKEN_QUERY` in the
  // connection layer), so anchor on that name rather than any `*token*` key.
  return url.replace(/([?&]token=)[^&#]+/gi, (_, prefix) => prefix + '·'.repeat(12))
}

function SidebarIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <path
        d="M6.6 9.4a2.4 2.4 0 0 0 3.4 0l1.9-1.9a2.4 2.4 0 0 0-3.4-3.4l-.6.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 6.6a2.4 2.4 0 0 0-3.4 0L4.1 8.5a2.4 2.4 0 0 0 3.4 3.4l.6-.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeviceLinkPanel() {
  const [links, setLinks] = useState([])
  const [entryId, setEntryId] = useState(() => readStore(STORE_ENTRY, 'public'))
  const [reveal, setReveal] = useState(() => readStore(STORE_REVEAL, '0') === '1')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState('')

  const load = async () => {
    setBusy(true)
    setFailed('')
    setCopied(false)
    try {
      const response = await fetch('/api/dsh/device-link', { credentials: 'same-origin' })
      if (!response.ok) throw new Error(String(response.status))
      const data = await response.json()
      const next = Array.isArray(data.links) ? data.links : []
      if (next.length === 0) throw new Error('no-entry')
      setLinks(next)
      // Keep the stored choice when it still exists; otherwise take the first.
      setEntryId((current) => (next.some((link) => link.id === current) ? current : next[0].id))
    } catch (error) {
      setFailed(
        error instanceof Error && error.message === 'no-entry'
          ? '没有找到可用的入口地址，请检查服务启动参数中的 --public-url 与 --host'
          : '生成失败，请查看服务日志后重试',
      )
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load()
    // One-shot read on mount: the launch token is process-scoped, not time-scoped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    writeStore(STORE_ENTRY, entryId)
  }, [entryId])

  useEffect(() => {
    writeStore(STORE_REVEAL, reveal ? '1' : '0')
  }, [reveal])

  const active = useMemo(
    () => links.find((link) => link.id === entryId) ?? links[0],
    [links, entryId],
  )

  const shown = active === undefined ? '' : reveal ? active.url : maskToken(active.url)

  const copy = async () => {
    if (active === undefined) return
    const ok = await copyText(active.url)
    setCopied(ok)
    if (!ok) setFailed('复制失败，请手动选中链接复制')
  }

  return (
    <div style={PAGE}>
      <div style={COLUMN}>
        <h1 style={HEADING}>新设备登录</h1>
        <p style={LEAD}>
          生成一个带登录令牌的链接。在手机或平板浏览器打开即可登录，无需在服务器上操作。
        </p>

        {links.length > 1 && (
          <section style={SECTION}>
            <div style={LEGEND}>入口地址</div>
            <div style={CHOICE_LIST}>
              {links.map((link, index) => {
                const selected = link.id === active?.id
                return (
                  <label key={link.id} style={choiceStyle(selected, index === links.length - 1)}>
                    <input
                      type="radio"
                      name="device-link-entry"
                      checked={selected}
                      onChange={() => {
                        setEntryId(link.id)
                        setCopied(false)
                      }}
                      style={RADIO}
                    />
                    <span style={CHOICE_BODY}>
                      <span style={CHOICE_TITLE}>{ENTRY_LABEL[link.id] ?? '入口'}</span>
                      <span style={CHOICE_ORIGIN}>{link.origin}</span>
                      {ENTRY_HINT[link.id] !== undefined && (
                        <span style={CHOICE_HINT}>{ENTRY_HINT[link.id]}</span>
                      )}
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        )}

        <section style={SECTION}>
          <div style={LEGEND}>登录链接</div>
          {active !== undefined ? (
            <>
              <div style={LINK_BOX}>
                <input
                  readOnly
                  value={shown}
                  onFocus={(event) => event.target.select()}
                  aria-label="新设备登录链接"
                  style={INPUT}
                />
                <button type="button" onClick={copy} style={buttonStyle(false)}>
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div style={META_ROW}>
                <label style={TOGGLE}>
                  <input
                    type="checkbox"
                    checked={reveal}
                    onChange={(event) => setReveal(event.target.checked)}
                  />
                  显示完整令牌
                </label>
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={busy}
                  style={buttonStyle(true)}
                >
                  {busy ? '生成中…' : '重新生成'}
                </button>
              </div>
            </>
          ) : (
            <div style={LINK_BOX}>
              <button
                type="button"
                onClick={() => void load()}
                disabled={busy}
                style={buttonStyle(true)}
              >
                {busy ? '生成中…' : '生成链接'}
              </button>
            </div>
          )}
          {failed !== '' && (
            <div role="alert" style={ERROR}>
              {failed}
            </div>
          )}
        </section>

        <div style={FOOTNOTE}>
          令牌等同于服务器控制权，请勿转发给他人。链接随服务重启而失效，届时重新生成即可；
          浏览器登录后会换取长期 Cookie，不必每次使用链接。
        </div>
      </div>
    </div>
  )
}

export const inject = ['slots']

export function apply(ctx) {
  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        label: () => '新设备登录',
      },
      SidebarIcon,
    ),
  )

  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
      },
      DeviceLinkPanel,
    ),
  )
}
