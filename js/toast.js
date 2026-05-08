// =========================================================
// Sistema de notificações elegantes
// =========================================================

import { el } from "./utils.js"

let region

function ensureRegion() {
  if (region) return region
  region = document.createElement("div")
  region.className = "toast-region"
  region.setAttribute("role", "status")
  region.setAttribute("aria-live", "polite")
  document.body.appendChild(region)
  return region
}

const ICON = {
  info: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  success: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warn: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
}

export function toast(message, { type = "info", duration = 3200 } = {}) {
  const r = ensureRegion()
  const node = el(
    "div",
    {
      class: `toast is-${type === "info" ? "info" : type}`,
      role: "alert",
    },
    el("span", { class: "toast__icon", html: ICON[type] || ICON.info }),
    el("span", { class: "toast__msg" }, message)
  )
  r.appendChild(node)
  setTimeout(() => {
    node.style.animation = "toast-out 240ms ease forwards"
    node.style.opacity = "0"
    node.style.transform = "translateX(110%)"
    setTimeout(() => node.remove(), 260)
  }, duration)
  return node
}

toast.success = (m, opts) => toast(m, { ...opts, type: "success" })
toast.error   = (m, opts) => toast(m, { ...opts, type: "error" })
toast.warn    = (m, opts) => toast(m, { ...opts, type: "warn" })
toast.info    = (m, opts) => toast(m, { ...opts, type: "info" })
