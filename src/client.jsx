import { useEffect, useMemo, useState } from 'react'
import { Button, Input, SegmentedControl, Switch } from '@deepseek-ai/dsh-client-ui-primitives'

/**
 * New-device login links, as a settings section.
 *
 * Registered on the shell's `settings.section` slot, so it lands in the
 * settings nav beside General / Models / Plugins and inherits that panel's
 * typography and spacing. Every control below is a host primitive, which
 * keeps the theme (light, dark, density, font family) in the host's hands.
 *
 * The host API answers every reachable entry point at once, so switching
 * between "public domain" and "LAN address" is a local choice — no second
 * round trip, and one launch token for all of them.
 */

const SECTION_ID = 'device-link'
const STYLE_ID = 'dsh-plugin-device-link'
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

/**
 * The section column: max width and title/intro typography copied from the
 * shipped sections (ui-agent-preset AgentPresetSection.module.css) so this
 * page sits flush with its neighbours. No font-family anywhere — the host's
 * body font is the intended typeface.
 */
const SECTION = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  maxWidth: 720,
  color: 'var(--dsw-alias-label-primary)',
}

const TITLE = { margin: 0, fontSize: 18, fontWeight: 600 }
const INTRO = {
  margin: 0,
  fontSize: 13,
  lineHeight: '20px',
  color: 'var(--dsw-alias-label-tertiary)',
}

/** Rows, copied from ui-settings-general DeveloperToolsRow.module.css. */
const ROW = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  padding: '16px 0',
  borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
}

const ROW_LAST = { ...ROW, borderBottom: 'none', paddingBottom: 0 }
const ROW_TITLE = { fontSize: 14, lineHeight: '20px' }
const ROW_DESC = {
  marginTop: 4,
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--dsw-alias-label-secondary)',
}

/** The link row stacks its control under the label so the URL keeps its width. */
const FIELD = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 0',
  borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
}

const LINK_BOX = { display: 'flex', alignItems: 'center', gap: 8 }

const FOOTNOTE = {
  margin: 0,
  fontSize: 12,
  lineHeight: '20px',
  color: 'var(--dsw-alias-label-tertiary)',
}

const ERROR = { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' }

/**
 * The host primitive renders `<span><input/></span>` and leaves the width to
 * the call site; other plugins pass a class for exactly this. One rule keeps
 * the field full-width and monospaced without shipping a stylesheet.
 */
function ensureStyle() {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin=${JSON.stringify(STYLE_ID)}]`) !== null) return
  const style = document.createElement('style')
  style.dataset.plugin = STYLE_ID
  style.textContent =
    // `flex: 1`, not `width: 100%`: the field shares a flex row with its copy
    // button and must claim the leftover space without pushing the button out.
    '.dsh-device-link-input{box-sizing:border-box;flex:1 1 auto;min-width:0}' +
    '.dsh-device-link-input input{box-sizing:border-box;width:100%;min-width:0;font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px}'
  document.head.appendChild(style)
}

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

function DeviceLinkSection() {
  const [links, setLinks] = useState([])
  const [entryId, setEntryId] = useState(() => readStore(STORE_ENTRY, 'public'))
  const [reveal, setReveal] = useState(() => readStore(STORE_REVEAL, '0') === '1')
  const [busy, setBusy] = useState(true)
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
          : '获取失败，请查看服务日志后重试',
      )
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    ensureStyle()
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

  const hint =
    active === undefined
      ? busy
        ? '正在获取…'
        : '暂无可用链接'
      : (ENTRY_HINT[active.id] ?? '')
  const entryOptions = links.map((link) => ({
    value: link.id,
    label: ENTRY_LABEL[link.id] ?? '入口',
    title: link.origin,
  }))

  return (
    <div style={SECTION}>
      <h2 style={TITLE}>新设备登录</h2>
      <p style={INTRO}>
        生成带登录令牌的链接，在手机或平板的浏览器里打开即可登录，不必去服务器上操作。
      </p>

      {links.length > 1 && (
        <div style={ROW}>
          <div>
            <div style={ROW_TITLE}>入口地址</div>
            <div style={ROW_DESC}>公网供外网访问，局域网在同一 Wi-Fi 下更快</div>
          </div>
          <SegmentedControl
            id="device-link-entry"
            label="入口地址"
            value={active?.id}
            options={entryOptions}
            onChange={(next) => {
              setEntryId(String(next))
              setCopied(false)
            }}
          />
        </div>
      )}

      <div style={FIELD}>
        <div>
          <div style={ROW_TITLE}>登录链接</div>
          {hint !== '' && <div style={ROW_DESC}>{hint}</div>}
        </div>
        <div style={LINK_BOX}>
          <Input
            className="dsh-device-link-input"
            readOnly
            value={shown}
            aria-label="新设备登录链接"
            onFocus={(event) => event.target.select()}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={active === undefined || busy}
            onClick={() => void copy()}
          >
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        {failed !== '' && (
          <p role="alert" style={ERROR}>
            {failed}
          </p>
        )}
      </div>

      <div style={ROW}>
        <div>
          <div style={ROW_TITLE}>显示完整令牌</div>
          <div style={ROW_DESC}>关闭时令牌打码，方便截图或投屏</div>
        </div>
        <Switch checked={reveal} label="显示完整令牌" onChange={setReveal} />
      </div>

      <div style={ROW_LAST}>
        <div>
          <div style={ROW_TITLE}>重新获取</div>
          <div style={ROW_DESC}>服务重启后令牌会变化，点此刷新</div>
        </div>
        <Button variant="outline" size="sm" disabled={busy} onClick={() => void load()}>
          {busy ? '获取中…' : '刷新'}
        </Button>
      </div>

      <p style={FOOTNOTE}>
        令牌等同于服务器控制权，请勿转发给他人。链接随服务重启而失效，届时点「刷新」即可；
        浏览器登录后会换取长期 Cookie，不必每次都用链接。
      </p>
    </div>
  )
}

export const inject = ['slots']

export function apply(ctx) {
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: SECTION_ID,
        // Between agent-presets (20) and third-party sections (40+).
        order: 30,
        label: () => '新设备登录',
      },
      DeviceLinkSection,
    ),
  )
}
