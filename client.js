window.__ModuleLoader__.load({
	id: "dsh-plugin-device-link",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime = require("react/jsx-runtime");
var SECTION_ID = "device-link";
var STYLE_ID = "dsh-plugin-device-link";
var STORE_ENTRY = "dsh.device-link.entry";
var STORE_REVEAL = "dsh.device-link.reveal";
var ENTRY_LABEL = {
  public: "公网",
  lan: "局域网",
  local: "本机"
};
var ENTRY_HINT = {
  public: "外网可访问，需域名解析正常",
  lan: "同一 Wi-Fi 下直连，速度更快",
  local: "仅本机可访问"
};
var SECTION = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 720,
  color: "var(--dsw-alias-label-primary)"
};
var TITLE = { margin: 0, fontSize: 18, fontWeight: 600 };
var INTRO = {
  margin: 0,
  fontSize: 13,
  lineHeight: "20px",
  color: "var(--dsw-alias-label-tertiary)"
};
var ROW = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  padding: "16px 0",
  borderBottom: "0.5px solid var(--dsw-alias-border-l2)"
};
var ROW_LAST = { ...ROW, borderBottom: "none", paddingBottom: 0 };
var ROW_TITLE = { fontSize: 14, lineHeight: "20px" };
var ROW_DESC = {
  marginTop: 4,
  fontSize: 12,
  lineHeight: "18px",
  color: "var(--dsw-alias-label-secondary)"
};
var FIELD = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "16px 0",
  borderBottom: "0.5px solid var(--dsw-alias-border-l2)"
};
var LINK_BOX = { display: "flex", alignItems: "center", gap: 8 };
var FOOTNOTE = {
  margin: 0,
  fontSize: 12,
  lineHeight: "20px",
  color: "var(--dsw-alias-label-tertiary)"
};
var ERROR = { margin: 0, fontSize: 12, color: "var(--dsw-alias-state-error-primary)" };
function ensureStyle() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`style[data-plugin=${JSON.stringify(STYLE_ID)}]`) !== null) return;
  const style = document.createElement("style");
  style.dataset.plugin = STYLE_ID;
  style.textContent = // `flex: 1`, not `width: 100%`: the field shares a flex row with its copy
  // button and must claim the leftover space without pushing the button out.
  ".dsh-device-link-input{box-sizing:border-box;flex:1 1 auto;min-width:0}.dsh-device-link-input input{box-sizing:border-box;width:100%;min-width:0;font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px}";
  document.head.appendChild(style);
}
function readStore(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}
function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
  }
}
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText !== void 0) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
function maskToken(url) {
  return url.replace(/([?&]token=)[^&#]+/gi, (_, prefix) => prefix + "·".repeat(12));
}
function DeviceLinkSection() {
  const [links, setLinks] = (0, import_react.useState)([]);
  const [entryId, setEntryId] = (0, import_react.useState)(() => readStore(STORE_ENTRY, "public"));
  const [reveal, setReveal] = (0, import_react.useState)(() => readStore(STORE_REVEAL, "0") === "1");
  const [busy, setBusy] = (0, import_react.useState)(true);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [failed, setFailed] = (0, import_react.useState)("");
  const load = async () => {
    setBusy(true);
    setFailed("");
    setCopied(false);
    try {
      const response = await fetch("/api/dsh/device-link", { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      const next = Array.isArray(data.links) ? data.links : [];
      if (next.length === 0) throw new Error("no-entry");
      setLinks(next);
      setEntryId((current) => next.some((link) => link.id === current) ? current : next[0].id);
    } catch (error) {
      setFailed(
        error instanceof Error && error.message === "no-entry" ? "没有找到可用的入口地址，请检查服务启动参数中的 --public-url 与 --host" : "获取失败，请查看服务日志后重试"
      );
    } finally {
      setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
    ensureStyle();
    void load();
  }, []);
  (0, import_react.useEffect)(() => {
    writeStore(STORE_ENTRY, entryId);
  }, [entryId]);
  (0, import_react.useEffect)(() => {
    writeStore(STORE_REVEAL, reveal ? "1" : "0");
  }, [reveal]);
  const active = (0, import_react.useMemo)(
    () => links.find((link) => link.id === entryId) ?? links[0],
    [links, entryId]
  );
  const shown = active === void 0 ? "" : reveal ? active.url : maskToken(active.url);
  const copy = async () => {
    if (active === void 0) return;
    const ok = await copyText(active.url);
    setCopied(ok);
    if (!ok) setFailed("复制失败，请手动选中链接复制");
  };
  const hint = active === void 0 ? busy ? "正在获取…" : "暂无可用链接" : ENTRY_HINT[active.id] ?? "";
  const entryOptions = links.map((link) => ({
    value: link.id,
    label: ENTRY_LABEL[link.id] ?? "入口",
    title: link.origin
  }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: SECTION, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { style: TITLE, children: "新设备登录" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: INTRO, children: "生成带登录令牌的链接，在手机或平板的浏览器里打开即可登录，不必去服务器上操作。" }),
    links.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: ROW, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_TITLE, children: "入口地址" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_DESC, children: "公网供外网访问，局域网在同一 Wi-Fi 下更快" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_dsh_client_ui_primitives.SegmentedControl,
        {
          id: "device-link-entry",
          label: "入口地址",
          value: active?.id,
          options: entryOptions,
          onChange: (next) => {
            setEntryId(String(next));
            setCopied(false);
          }
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: FIELD, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_TITLE, children: "登录链接" }),
        hint !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_DESC, children: hint })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: LINK_BOX, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_dsh_client_ui_primitives.Input,
          {
            className: "dsh-device-link-input",
            readOnly: true,
            value: shown,
            "aria-label": "新设备登录链接",
            onFocus: (event) => event.target.select()
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_dsh_client_ui_primitives.Button,
          {
            variant: "outline",
            size: "sm",
            disabled: active === void 0 || busy,
            onClick: () => void copy(),
            children: copied ? "已复制" : "复制"
          }
        )
      ] }),
      failed !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", style: ERROR, children: failed })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: ROW, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_TITLE, children: "显示完整令牌" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_DESC, children: "关闭时令牌打码，方便截图或投屏" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Switch, { checked: reveal, label: "显示完整令牌", onChange: setReveal })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: ROW_LAST, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_TITLE, children: "重新获取" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: ROW_DESC, children: "服务重启后令牌会变化，点此刷新" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => void load(), children: busy ? "获取中…" : "刷新" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: FOOTNOTE, children: "令牌等同于服务器控制权，请勿转发给他人。链接随服务重启而失效，届时点「刷新」即可； 浏览器登录后会换取长期 Cookie，不必每次都用链接。" })
  ] });
}
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: SECTION_ID,
        // Between agent-presets (20) and third-party sections (40+).
        order: 30,
        label: () => "新设备登录"
      },
      DeviceLinkSection
    )
  );
}
		return module.exports;
	}
});
