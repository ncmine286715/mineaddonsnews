// =========================================================
// Lógica da Home — render dinâmico de seções
// =========================================================

import { $, $$, debounce, escapeHtml, formatNumber } from "./utils.js"
import { DB } from "./db.js"
import { CATEGORIES } from "./config.js"
import { renderAddonGrid } from "./addon-card.js"
import {
  mountHeader,
  mountFooter,
  initReveal,
  initTilt,
  animateCounters,
  initTopbarShadow,
  hidePreloader,
} from "./ui.js"
import { initHeroBg } from "./three-bg.js"

// Inicializa db
DB.init()

// ---------- Categories icons (inline SVG mini-set) ----------
const CAT_ICONS = {
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="M5 19v2M19 19v2M5 3v2"/></svg>',
  cpu:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>',
  sword:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14.5 17.5 4-4M3 21l5-1 13-13-4-4L4 16l-1 5Z"/></svg>',
  ghost:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 10h.01M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2 3 3-3 3 3 2-3 3 3V10a8 8 0 0 0-8-8Z"/></svg>',
  castle:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V8l3-3 3 3 3-3 3 3 3-3 3 3v13"/><path d="M3 14h18M9 21v-6h6v6"/></svg>',
  wrench:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 1 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-3-3-3 3 0Z"/></svg>',
  image:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
  palette:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12.5" r="0.5"/><path d="M12 2a10 10 0 0 0 0 20c1 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 8 8 0 0 0-10-11Z"/></svg>',
}

const settings = DB.settings.get()

// ---------- Render Featured Creator ("Meus Addons") ----------
function renderFeaturedCreator() {
  const wrap = $("#creator")
  if (!settings.showFeaturedCreator) { wrap?.remove(); return }
  const list = DB.addons.featuredCreator()
  if (!list.length) { wrap?.remove(); return }

  $("#creator-grid").innerHTML = renderAddonGrid(list)
}

// ---------- Render Categories ----------
function renderCategories() {
  const wrap = $("#categories")
  if (!settings.showCategories) { wrap?.remove(); return }
  const all = DB.addons.all()
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
  for (const a of all) counts[a.category] = (counts[a.category] || 0) + 1

  $("#categories-grid").innerHTML = CATEGORIES.map((c) => `
    <button class="category" data-cat="${c.id}" type="button">
      <span class="category__icon">${CAT_ICONS[c.icon] || CAT_ICONS.sparkles}</span>
      <span class="category__name">${escapeHtml(c.name)}</span>
      <span class="category__count">${counts[c.id] || 0} addons</span>
    </button>
  `).join("")

  $$(".category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat
      const chip = $(`.chip[data-cat="${cat}"]`)
      if (chip) {
        $$(".chip").forEach((c) => c.classList.remove("is-active"))
        chip.classList.add("is-active")
      }
      state.category = cat
      renderAddonsList()
      $("#addons").scrollIntoView({ behavior: "smooth", block: "start" })
    })
  })
}

// ---------- Render Chips de filtro ----------
function renderChips() {
  const chips = [{ id: "all", name: "Todos" }, ...CATEGORIES]
  $("#chip-row").innerHTML = chips.map((c) => `
    <button class="chip ${c.id === "all" ? "is-active" : ""}" data-cat="${c.id}" type="button">${escapeHtml(c.name)}</button>
  `).join("")
  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      $$(".chip").forEach((x) => x.classList.remove("is-active"))
      c.classList.add("is-active")
      state.category = c.dataset.cat
      renderAddonsList()
    })
  )
}

// ---------- Render Addons list (filtros) ----------
const state = { query: "", category: "all" }

function renderAddonsList() {
  const list = DB.addons.search(state.query, state.category)
  $("#addons-grid").innerHTML = renderAddonGrid(list)
  initTilt(".addons-grid .tilt")
}

// ---------- Render Trending ----------
function renderTrending() {
  $("#trending-grid").innerHTML = renderAddonGrid(DB.addons.trending(6))
  initTilt(".trending-grid .tilt")
}

// ---------- Render Featured Grid (destaques) ----------
function renderFeatured() {
  $("#featured-grid").innerHTML = renderAddonGrid(DB.addons.recent(4))
  initTilt(".featured-grid .tilt")
}

// ---------- Render Linktree ----------
function renderLinktree() {
  const links = DB.links.list()
  if (!links.length) {
    $("#linktree").innerHTML = `<p class="muted">Nenhum link ainda. Configure no painel admin.</p>`
    return
  }
  $("#linktree").innerHTML = links.map((l) => `
    <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener" class="linktree-item">
      <span class="linktree-icon">${escapeHtml(l.icon || "🔗")}</span>
      <span>${escapeHtml(l.label)}</span>
    </a>
  `).join("")
}

// ---------- Hero stats ----------
function renderHeroStats() {
  const total = DB.addons.all().length
  const dls   = DB.addons.all().reduce((sum, a) => sum + (a.downloads || 0), 0)
  $("#stat-addons").dataset.count = total
  $("#stat-downloads").dataset.count = dls
  $("#stat-downloads").dataset.format = "k"
}

// ---------- Search ----------
function initSearch() {
  const input = $("#search-input")
  if (!input) return
  input.addEventListener("input", debounce((e) => {
    state.query = e.target.value
    renderAddonsList()
  }, 200))
}

// ---------- Settings hook ----------
function applySettings() {
  if (!settings.showStats) $(".hero-stats")?.remove()
  if (!settings.showSecurity) $("#security")?.remove()
  if (!settings.showYoutube) $("#youtube")?.remove()
  $("[data-bind=heroSubtitle]")?.replaceChildren(document.createTextNode(settings.heroSubtitle))
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  mountHeader({ active: "home" })
  applySettings()
  renderFeatured()
  renderFeaturedCreator()
  renderCategories()
  renderChips()
  renderHeroStats()
  renderAddonsList()
  renderTrending()
  renderLinktree()
  initSearch()
  mountFooter()
  initReveal()
  initTilt()
  animateCounters()
  initTopbarShadow()
  initHeroBg($("#bg-canvas")).catch((e) => console.warn("[hero] failed", e))
  hidePreloader()
})