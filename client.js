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
var import_jsx_runtime = require("react/jsx-runtime");
var PANEL_ID = "device-link";
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
var PAGE = {
  height: "100%",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "40px 24px 64px"
};
var COLUMN = { maxWidth: 720, margin: "0 auto" };
var HEADING = { margin: 0, fontSize: 20, lineHeight: "26px", fontWeight: 600 };
var LEAD = {
  margin: "8px 0 0",
  color: "var(--dsw-alias-label-secondary)",
  fontSize: 13,
  lineHeight: "20px"
};
var SECTION = { marginTop: 32 };
var LEGEND = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--dsw-alias-label-secondary)",
  letterSpacing: "0.01em",
  marginBottom: 8
};
var CHOICE_LIST = {
  border: "0.5px solid var(--dsw-alias-border-l2)",
  borderRadius: 10,
  overflow: "hidden"
};
var choiceStyle = (selected, last) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 14px",
  cursor: "pointer",
  background: selected ? "var(--dsw-alias-bg-l2)" : "transparent",
  borderBottom: last ? "none" : "0.5px solid var(--dsw-alias-border-l2)"
});
var RADIO = { marginTop: 3, flex: "none", cursor: "pointer" };
var CHOICE_BODY = { minWidth: 0, flex: 1, display: "block" };
var CHOICE_TITLE = { display: "block", fontSize: 13, lineHeight: "18px" };
var CHOICE_ORIGIN = {
  display: "block",
  marginTop: 2,
  fontSize: 12,
  lineHeight: "18px",
  color: "var(--dsw-alias-label-secondary)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
var CHOICE_HINT = {
  display: "block",
  marginTop: 2,
  fontSize: 12,
  lineHeight: "18px",
  color: "var(--dsw-alias-label-secondary)"
};
var LINK_BOX = { display: "flex", alignItems: "stretch", gap: 8, marginTop: 12 };
var INPUT = {
  flex: 1,
  minWidth: 0,
  padding: "8px 10px",
  fontSize: 12,
  lineHeight: "18px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "inherit",
  background: "var(--dsw-alias-bg-base)",
  border: "0.5px solid var(--dsw-alias-border-l2)",
  borderRadius: 8
};
var buttonStyle = (primary) => ({
  flex: "none",
  padding: "8px 14px",
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 500,
  cursor: "pointer",
  borderRadius: 8,
  border: primary ? "none" : "0.5px solid var(--dsw-alias-border-l2)",
  color: primary ? "#fff" : "inherit",
  background: primary ? "var(--dsw-alias-accent, #3b6cf6)" : "transparent"
});
var META_ROW = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginTop: 10,
  flexWrap: "wrap"
};
var TOGGLE = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "var(--dsw-alias-label-secondary)",
  cursor: "pointer"
};
var FOOTNOTE = {
  marginTop: 28,
  paddingTop: 20,
  borderTop: "0.5px solid var(--dsw-alias-border-l2)",
  fontSize: 12,
  lineHeight: "20px",
  color: "var(--dsw-alias-label-secondary)"
};
var ERROR = { marginTop: 10, fontSize: 12, color: "var(--dsw-alias-label-error, #d33)" };
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
function SidebarIcon({ size = 16 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      focusable: "false",
      style: { display: "block" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            d: "M6.6 9.4a2.4 2.4 0 0 0 3.4 0l1.9-1.9a2.4 2.4 0 0 0-3.4-3.4l-.6.6",
            stroke: "currentColor",
            strokeWidth: "1.3",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "path",
          {
            d: "M9.4 6.6a2.4 2.4 0 0 0-3.4 0L4.1 8.5a2.4 2.4 0 0 0 3.4 3.4l.6-.6",
            stroke: "currentColor",
            strokeWidth: "1.3",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        )
      ]
    }
  );
}
function DeviceLinkPanel() {
  const [links, setLinks] = (0, import_react.useState)([]);
  const [entryId, setEntryId] = (0, import_react.useState)(() => readStore(STORE_ENTRY, "public"));
  const [reveal, setReveal] = (0, import_react.useState)(() => readStore(STORE_REVEAL, "0") === "1");
  const [busy, setBusy] = (0, import_react.useState)(false);
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
        error instanceof Error && error.message === "no-entry" ? "没有找到可用的入口地址，请检查服务启动参数中的 --public-url 与 --host" : "生成失败，请查看服务日志后重试"
      );
    } finally {
      setBusy(false);
    }
  };
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: PAGE, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: COLUMN, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { style: HEADING, children: "新设备登录" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: LEAD, children: "生成一个带登录令牌的链接。在手机或平板浏览器打开即可登录，无需在服务器上操作。" }),
    links.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { style: SECTION, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: LEGEND, children: "入口地址" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: CHOICE_LIST, children: links.map((link, index) => {
        const selected = link.id === active?.id;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: choiceStyle(selected, index === links.length - 1), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "radio",
              name: "device-link-entry",
              checked: selected,
              onChange: () => {
                setEntryId(link.id);
                setCopied(false);
              },
              style: RADIO
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: CHOICE_BODY, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: CHOICE_TITLE, children: ENTRY_LABEL[link.id] ?? "入口" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: CHOICE_ORIGIN, children: link.origin }),
            ENTRY_HINT[link.id] !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: CHOICE_HINT, children: ENTRY_HINT[link.id] })
          ] })
        ] }, link.id);
      }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { style: SECTION, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: LEGEND, children: "登录链接" }),
      active !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: LINK_BOX, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              readOnly: true,
              value: shown,
              onFocus: (event) => event.target.select(),
              "aria-label": "新设备登录链接",
              style: INPUT
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: copy, style: buttonStyle(false), children: copied ? "已复制" : "复制" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: META_ROW, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: TOGGLE, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: reveal,
                onChange: (event) => setReveal(event.target.checked)
              }
            ),
            "显示完整令牌"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              onClick: () => void load(),
              disabled: busy,
              style: buttonStyle(true),
              children: busy ? "生成中…" : "重新生成"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: LINK_BOX, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          onClick: () => void load(),
          disabled: busy,
          style: buttonStyle(true),
          children: busy ? "生成中…" : "生成链接"
        }
      ) }),
      failed !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "alert", style: ERROR, children: failed })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: FOOTNOTE, children: "令牌等同于服务器控制权，请勿转发给他人。链接随服务重启而失效，届时重新生成即可； 浏览器登录后会换取长期 Cookie，不必每次使用链接。" })
  ] }) });
}
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject(
    "sidebar.panellist",
    () => ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 20,
        label: () => "新设备登录"
      },
      SidebarIcon
    )
  );
  ctx.slots.inject(
    "main",
    () => ctx.slots.register(
      {
        name: "main",
        key: PANEL_ID
      },
      DeviceLinkPanel
    )
  );
}
		return module.exports;
	}
});
