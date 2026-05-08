// =========================================================
// Camada de dados (Addons, Links, Settings)
// API unificada exportada como DB
// =========================================================

import { storage } from "./storage.js"
import { uid, slugify } from "./utils.js"
import { BACKEND_MODE, CATEGORIES } from "./config.js"

const KEY_ADDONS   = "addons"
const KEY_LINKS    = "links"
const KEY_SETTINGS = "settings"
const KEY_SEEDED   = "seeded"

// ---------- Seed inicial ----------
const SEED_ADDONS = [
  {
    id: "magic-runes-pro",
    slug: "magic-runes-pro",
    title: "Magic Runes Pro",
    category: "Magia",
    description: "Sistema completo de magia rúnica com 24 feitiços únicos, mobs invocáveis e efeitos visuais cinematográficos.",
    longDescription: "Magic Runes Pro é um addon de magia profissional que adiciona um sistema completo de runas mágicas ao Minecraft Bedrock. Crie pergaminhos, invoque feitiços e domine elementos antigos com VFX premium.",
    image: "",
    banner: "",
    download: "https://example.com/download/magic-runes-pro.mcaddon",
    version: "2.4.1",
    compat: "1.21+",
    author: "Mine Addons News",
    tags: ["magia", "rpg", "feitiços", "vfx"],
    downloads: 18420,
    rating: 4.9,
    premium: true,
    featuredCreator: true,
    createdAt: "2026-04-12T10:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    changelog: [
      { version: "2.4.1", date: "2026-05-01", notes: ["Correção de crash em Realms", "Novo feitiço: Tempestade Astral"] },
      { version: "2.3.0", date: "2026-03-18", notes: ["10 novos efeitos visuais", "Otimização de partículas"] },
    ],
  },
  {
    id: "tech-machinery",
    slug: "tech-machinery",
    title: "Tech Machinery",
    category: "Tecnologia",
    description: "Esteiras, fornos automáticos e máquinas industriais que transformam sua base em uma fábrica.",
    image: "",
    banner: "",
    download: "https://example.com/download/tech-machinery.mcaddon",
    version: "1.8.0",
    compat: "1.21+",
    author: "Mine Addons News",
    tags: ["tech", "máquinas", "automação"],
    downloads: 9620,
    rating: 4.7,
    premium: true,
    featuredCreator: true,
    createdAt: "2026-03-22T10:00:00Z",
    updatedAt: "2026-04-22T10:00:00Z",
    changelog: [
      { version: "1.8.0", date: "2026-04-22", notes: ["Nova esteira de alta velocidade", "Melhor compatibilidade com Realms"] },
    ],
  },
  {
    id: "dragon-knight",
    slug: "dragon-knight",
    title: "Dragon Knight Weapons",
    category: "Armas",
    description: "20 armas lendárias com habilidades exclusivas, animações 3D e sons épicos.",
    image: "",
    banner: "",
    download: "https://example.com/download/dragon-knight.mcaddon",
    version: "3.1.0",
    compat: "1.21+",
    author: "Mine Addons News",
    tags: ["armas", "rpg", "lendárias"],
    downloads: 24130,
    rating: 4.8,
    premium: true,
    featuredCreator: true,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
    changelog: [
      { version: "3.1.0", date: "2026-04-15", notes: ["3 novas armas lendárias", "Habilidade especial: Dash explosivo"] },
    ],
  },
  {
    id: "ancient-mobs",
    slug: "ancient-mobs",
    title: "Ancient Mobs",
    category: "Mobs",
    description: "12 criaturas inéditas com IA avançada, drops únicos e bossfights cinematográficos.",
    image: "",
    banner: "",
    download: "https://example.com/download/ancient-mobs.mcaddon",
    version: "1.4.2",
    compat: "1.21+",
    author: "Aurora Studios",
    tags: ["mobs", "boss", "ia"],
    downloads: 7320,
    rating: 4.6,
    premium: false,
    featuredCreator: false,
    createdAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-04-28T10:00:00Z",
    changelog: [{ version: "1.4.2", date: "2026-04-28", notes: ["Balanceamento de bosses"] }],
  },
  {
    id: "neon-shaders",
    slug: "neon-shaders",
    title: "Neon Cyber Shaders",
    category: "Shaders",
    description: "Shaders cyberpunk com bloom, reflexos volumétricos e iluminação dinâmica.",
    image: "",
    banner: "",
    download: "https://example.com/download/neon-shaders.mcpack",
    version: "0.9.5",
    compat: "1.21+ RTX",
    author: "Pixel Forge",
    tags: ["shaders", "cyber", "iluminação"],
    downloads: 12410,
    rating: 4.7,
    premium: false,
    featuredCreator: false,
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-04-10T10:00:00Z",
    changelog: [{ version: "0.9.5", date: "2026-04-10", notes: ["Performance +30%"] }],
  },
  {
    id: "kingdom-structures",
    slug: "kingdom-structures",
    title: "Kingdom Structures",
    category: "Estruturas",
    description: "Castelos, vilas e fortalezas que aparecem naturalmente em mundos novos.",
    image: "",
    banner: "",
    download: "https://example.com/download/kingdom-structures.mcaddon",
    version: "2.0.1",
    compat: "1.21+",
    author: "Kingdom Devs",
    tags: ["estruturas", "geração", "medieval"],
    downloads: 5430,
    rating: 4.5,
    premium: false,
    featuredCreator: false,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-04-02T10:00:00Z",
    changelog: [{ version: "2.0.1", date: "2026-04-02", notes: ["Correção em geração de castelos"] }],
  },
]

const SEED_LINKS = [
  { id: "link-1", label: "YouTube", url: "https://youtube.com/@mineaddonsnews", icon: "youtube" },
  { id: "link-2", label: "Discord", url: "https://discord.gg/mineaddonsnews", icon: "discord" },
  { id: "link-3", label: "TikTok", url: "https://tiktok.com/@mineaddonsnews", icon: "tiktok" },
  { id: "link-4", label: "Instagram", url: "https://instagram.com/mineaddonsnews", icon: "instagram" },
]

const DEFAULT_SETTINGS = {
  siteName: "Mine Addons News",
  tagline: "Addons premium para Minecraft Bedrock",
  heroSubtitle: "A central definitiva de Addons para Minecraft Bedrock. Cards premium, downloads seguros, atualizações constantes.",
  showFeaturedCreator: true,
  showCategories: true,
  showStats: true,
  showSecurity: true,
  showYoutube: true,
  youtubeUrl: "https://youtube.com/@mineaddonsnews",
  theme: "dark",
}

// ---------- Bootstrap ----------
function ensureSeeded() {
  if (!storage.read(KEY_SEEDED)) {
    storage.write(KEY_ADDONS, SEED_ADDONS)
    storage.write(KEY_LINKS, SEED_LINKS)
    storage.write(KEY_SETTINGS, DEFAULT_SETTINGS)
    storage.write(KEY_SEEDED, true)
  }
}

// ---------- Addons API ----------
const addonsDb = {
  all() { return storage.read(KEY_ADDONS, []) || [] },

  byId(id) { return this.all().find((a) => a.id === id) || null },

  bySlug(slug) { return this.all().find((a) => a.slug === slug) || null },

  byCategory(catId) {
    if (!catId || catId === "all") return this.all()
    return this.all().filter((a) => a.category === catId)
  },

  featuredCreator() { return this.all().filter((a) => a.featuredCreator) },

  recent(limit = 8) {
    return [...this.all()]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit)
  },

  trending(limit = 6) {
    return [...this.all()]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, limit)
  },

  search(query, catId = "all") {
    const q = (query || "").trim().toLowerCase()
    let list = this.byCategory(catId)
    if (!q) return list
    return list.filter((a) =>
      [a.title, a.description, a.author, ...(a.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  },

  create(data) {
    const list = this.all()
    const slug = slugify(data.slug || data.title)
    const now = new Date().toISOString()
    const addon = {
      id: data.id || uid(),
      slug,
      title: data.title?.trim() || "Untitled",
      category: data.category || "Utilidades",
      description: data.description || "",
      longDescription: data.longDescription || "",
      image: data.image || "",
      banner: data.banner || data.image || "",
      download: data.download || data.downloadUrl || "#",
      version: data.version || "1.0.0",
      compat: data.compat || data.mcVersion || "1.21+",
      author: data.author || "Mine Addons News",
      tags: Array.isArray(data.tags)
        ? data.tags
        : String(data.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      downloads: Number(data.downloads) || 0,
      rating: Number(data.rating) || 0,
      premium: Boolean(data.premium),
      featuredCreator: Boolean(data.featuredCreator || data.featured),
      createdAt: data.createdAt || now,
      updatedAt: now,
      changelog: data.changelog || [{ version: data.version || "1.0.0", date: now.slice(0, 10), notes: ["Lançamento inicial"] }],
    }
    list.push(addon)
    storage.write(KEY_ADDONS, list)
    return addon
  },

  update(id, patch) {
    const list = this.all()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) return null
    const updated = {
      ...list[idx],
      ...patch,
      tags: Array.isArray(patch.tags)
        ? patch.tags
        : typeof patch.tags === "string"
        ? patch.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : list[idx].tags,
      updatedAt: new Date().toISOString(),
      slug: patch.slug ? slugify(patch.slug) : list[idx].slug,
      category: patch.category || list[idx].category,
      compat: patch.compat || patch.mcVersion || list[idx].compat,
      download: patch.download || patch.downloadUrl || list[idx].download,
      featuredCreator: patch.featuredCreator !== undefined ? patch.featuredCreator : patch.featured !== undefined ? patch.featured : list[idx].featuredCreator,
    }
    list[idx] = updated
    storage.write(KEY_ADDONS, list)
    return updated
  },

  remove(id) {
    const list = this.all().filter((a) => a.id !== id)
    storage.write(KEY_ADDONS, list)
    return true
  },

  incrementDownloads(id) {
    const a = this.byId(id)
    if (!a) return
    this.update(id, { downloads: (a.downloads || 0) + 1 })
  },
}

// ---------- Links API ----------
const linksDb = {
  list() { return storage.read(KEY_LINKS, []) || [] },

  get(id) { return this.list().find((l) => l.id === id) || null },

  create(data) {
    const list = this.list()
    const link = {
      id: data.id || uid(),
      label: data.label?.trim() || "Link",
      url: data.url?.trim() || "#",
      icon: data.icon || "",
    }
    list.push(link)
    storage.write(KEY_LINKS, list)
    return link
  },

  update(id, patch) {
    const list = this.list()
    const idx = list.findIndex((l) => l.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...patch }
    storage.write(KEY_LINKS, list)
    return list[idx]
  },

  remove(id) {
    const list = this.list().filter((l) => l.id !== id)
    storage.write(KEY_LINKS, list)
    return true
  },

  move(id, offset) {
    const list = this.list()
    const idx = list.findIndex((l) => l.id === id)
    if (idx === -1) return
    const newIdx = idx + offset
    if (newIdx < 0 || newIdx >= list.length) return
    const [item] = list.splice(idx, 1)
    list.splice(newIdx, 0, item)
    storage.write(KEY_LINKS, list)
  },
}

// ---------- Settings API ----------
const settingsDb = {
  get() { return { ...DEFAULT_SETTINGS, ...(storage.read(KEY_SETTINGS) || {}) } },
  update(patch) {
    const next = { ...this.get(), ...patch }
    storage.write(KEY_SETTINGS, next)
    return next
  },
  reset() {
    storage.write(KEY_SETTINGS, DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  },
}

// ---------- DB unificado ----------
export const DB = {
  addons: addonsDb,
  links: linksDb,
  settings: settingsDb,

  init() {
    ensureSeeded()
  },

  seed(force = false) {
    if (force) {
      storage.write(KEY_ADDONS, SEED_ADDONS)
      storage.write(KEY_LINKS, SEED_LINKS)
      storage.write(KEY_SETTINGS, DEFAULT_SETTINGS)
      storage.write(KEY_SEEDED, true)
    } else {
      ensureSeeded()
    }
  },

  exportAll() {
    return JSON.stringify({
      addons: addonsDb.all(),
      links: linksDb.list(),
      settings: settingsDb.get(),
    }, null, 2)
  },

  importAll(json) {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json
      if (data.addons) storage.write(KEY_ADDONS, data.addons)
      if (data.links) storage.write(KEY_LINKS, data.links)
      if (data.settings) storage.write(KEY_SETTINGS, data.settings)
      return true
    } catch (e) {
      console.warn("[db] import failed", e)
      return false
    }
  },
}

// Para compatibilidade com módulos que importavam `addonsDb` diretamente
export const addonsDb = DB.addons
export const settingsDb = DB.settings

// Marca backend para debug
if (typeof window !== "undefined") window.__MAN_BACKEND__ = BACKEND_MODE