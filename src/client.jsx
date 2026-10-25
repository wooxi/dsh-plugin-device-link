import { useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'

const ROW = {
  borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 24,
  padding: '16px 0',
}

const TITLE = { fontSize: 14, lineHeight: '20px' }
const DESC = { color: 'var(--dsw-alias-label-secondary)', marginTop: 4, fontSize: 12, lineHeight: '18px' }
const INPUT = {
  width: '100%',
  marginTop: 8,
  padding: '6px 8px',
  fontSize: 12,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  color: 'inherit',
  background: 'var(--dsw-alias-bg-base)',
  border: '0.5px solid var(--dsw-alias-border-l2)',
  borderRadius: 6,
}
const ERROR = { color: 'var(--dsw-alias-label-error, #d33)', fontSize: 12, marginTop: 4 }

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText !== undefined) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the execCommand path (plain-HTTP origin).
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

function DeviceLinkRow() {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  const generate = async () => {
    setBusy(true)
    setFailed(false)
    setCopied(false)
    try {
      const response = await fetch('/api/dsh/device-link', { credentials: 'same-origin' })
      if (!response.ok) throw new Error(String(response.status))
      const data = await response.json()
      setUrl(data.url)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    const ok = await copyText(url)
    setCopied(ok)
    if (!ok) setFailed(true)
  }

  return (
    <div style={ROW}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={TITLE}>新设备登录</div>
        <div style={DESC}>
          生成一个带登录令牌的链接，在手机或平板浏览器打开即可登录（有效期 30 天）。
          令牌等同于服务器控制权，请勿转发给他人；服务重启后链接会失效，需要重新生成。
        </div>
        {url !== '' && (
          <input
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            style={INPUT}
            aria-label="新设备登录链接"
          />
        )}
        {failed && <div role="alert" style={ERROR}>生成或复制失败，请查看服务日志后重试</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
        <Button size="sm" onClick={generate} disabled={busy}>
          {url === '' ? '生成链接' : '刷新链接'}
        </Button>
        {url !== '' && (
          <Button size="sm" onClick={copy}>
            {copied ? '已复制' : '复制'}
          </Button>
        )}
      </div>
    </div>
  )
}

export const inject = ['slots']

export function apply(ctx) {
  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register(
      {
        name: 'settings.general.item',
        id: 'device-link',
        order: 20,
      },
      DeviceLinkRow,
    ),
  )
}
