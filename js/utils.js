// =========================================================
// Utilitários compartilhados
// =========================================================

// ---------- DOM helpers ----------
export const $  = (sel, ctx = document) => ctx.querySelector(sel)
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v
    else if (k === "html") node.innerHTML = v
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v)
    else if (v === false || v == null) continue
    else node.setAttribute(k, v === true ? "" : v)
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue
    node.append(c.nodeType ? c : document.createTextNode(String(c)))
  }
  return node
}

// ---------- IDs ----------
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const slugify = (str) =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

// ---------- Format ----------
export const formatNumber = (n) => {
  if (typeof n !== "number") return "0"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}
export const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  } catch { return "" }
}

// ---------- Sanitização (anti XSS) ----------
const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
export const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => escapeMap[c])

// Permite só http/https em URLs antes de inserir no DOM
export function safeUrl(url) {
  if (!url) return "#"
  try {
    const u = new URL(url, location.origin)
    if (!/^https?:$/.test(u.protocol)) return "#"
    return u.href
  } catch { return "#" }
}

// ---------- Debounce ----------
export function debounce(fn, ms = 250) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

// ---------- Query string ----------
export const getQuery = (key) => new URLSearchParams(location.search).get(key)

// ---------- Sleep ----------
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------- Clamp ----------
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

// ---------- Image fallback ----------
export const placeholderImg = (label = "Addon") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#11141d'/>
          <stop offset='1' stop-color='#0b0d14'/>
        </linearGradient>
        <pattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'>
          <path d='M40 0H0V40' stroke='rgba(255,255,255,0.04)' fill='none'/>
        </pattern>
      </defs>
      <rect width='800' height='500' fill='url(#g)'/>
      <rect width='800' height='500' fill='url(#p)'/>
      <circle cx='400' cy='220' r='80' fill='none' stroke='#00d4ff' stroke-width='2' opacity='0.5'/>
      <text x='50%' y='62%' fill='#aab1c4' font-family='monospace' font-size='28' text-anchor='middle' font-weight='bold' letter-spacing='4'>${label}</text>
    </svg>`
  )}`

// ---------- Copy to clipboard ----------
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { return false }
}
