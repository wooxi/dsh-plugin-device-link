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
var ROW = {
  borderBottom: "0.5px solid var(--dsw-alias-border-l2)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 24,
  padding: "16px 0"
};
var TITLE = { fontSize: 14, lineHeight: "20px" };
var DESC = { color: "var(--dsw-alias-label-secondary)", marginTop: 4, fontSize: 12, lineHeight: "18px" };
var INPUT = {
  width: "100%",
  marginTop: 8,
  padding: "6px 8px",
  fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  color: "inherit",
  background: "var(--dsw-alias-bg-base)",
  border: "0.5px solid var(--dsw-alias-border-l2)",
  borderRadius: 6
};
var ERROR = { color: "var(--dsw-alias-label-error, #d33)", fontSize: 12, marginTop: 4 };
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
function DeviceLinkRow() {
  const [url, setUrl] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [failed, setFailed] = (0, import_react.useState)(false);
  const generate = async () => {
    setBusy(true);
    setFailed(false);
    setCopied(false);
    try {
      const response = await fetch("/api/dsh/device-link", { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      setUrl(data.url);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    const ok = await copyText(url);
    setCopied(ok);
    if (!ok) setFailed(true);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: ROW, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 0, flex: 1 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: TITLE, children: "\u65B0\u8BBE\u5907\u767B\u5F55" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: DESC, children: "\u751F\u6210\u4E00\u4E2A\u5E26\u767B\u5F55\u4EE4\u724C\u7684\u94FE\u63A5\uFF0C\u5728\u624B\u673A\u6216\u5E73\u677F\u6D4F\u89C8\u5668\u6253\u5F00\u5373\u53EF\u767B\u5F55\uFF08\u6709\u6548\u671F 30 \u5929\uFF09\u3002 \u4EE4\u724C\u7B49\u540C\u4E8E\u670D\u52A1\u5668\u63A7\u5236\u6743\uFF0C\u8BF7\u52FF\u8F6C\u53D1\u7ED9\u4ED6\u4EBA\uFF1B\u670D\u52A1\u91CD\u542F\u540E\u94FE\u63A5\u4F1A\u5931\u6548\uFF0C\u9700\u8981\u91CD\u65B0\u751F\u6210\u3002" }),
      url !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          readOnly: true,
          value: url,
          onFocus: (event) => event.target.select(),
          style: INPUT,
          "aria-label": "\u65B0\u8BBE\u5907\u767B\u5F55\u94FE\u63A5"
        }
      ),
      failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { role: "alert", style: ERROR, children: "\u751F\u6210\u6216\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u670D\u52A1\u65E5\u5FD7\u540E\u91CD\u8BD5" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, flex: "none" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { size: "sm", onClick: generate, disabled: busy, children: url === "" ? "\u751F\u6210\u94FE\u63A5" : "\u5237\u65B0\u94FE\u63A5" }),
      url !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { size: "sm", onClick: copy, children: copied ? "\u5DF2\u590D\u5236" : "\u590D\u5236" })
    ] })
  ] });
}
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject(
    "settings.general.item",
    () => ctx.slots.register(
      {
        name: "settings.general.item",
        id: "device-link",
        order: 20
      },
      DeviceLinkRow
    )
  );
}
		return module.exports;
	}
});
