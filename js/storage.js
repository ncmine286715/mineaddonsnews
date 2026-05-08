// =========================================================
// Storage abstrato (localStorage agora; trocar por Firebase/GitHub depois)
// Tudo que precisa persistir passa por aqui.
// =========================================================

const NAMESPACE = "man:v1:"

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NAMESPACE + key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.warn("[storage] read failed", key, e)
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn("[storage] write failed", key, e)
    return false
  }
}

function remove(key) {
  localStorage.removeItem(NAMESPACE + key)
}

export const storage = { read, write, remove }

// ---------- Cache simples com TTL (serve para GitHub fetches futuros) ----------
export function cacheGet(key, ttlMs) {
  const entry = read("cache:" + key)
  if (!entry) return null
  if (ttlMs && Date.now() - entry.t > ttlMs) {
    remove("cache:" + key)
    return null
  }
  return entry.v
}
export function cacheSet(key, value) {
  write("cache:" + key, { t: Date.now(), v: value })
}
