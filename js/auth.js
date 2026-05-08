// =========================================================
// Auth — Local (sessão localStorage). Trocar por Firebase Auth depois.
// =========================================================

import { storage } from "./storage.js"
import { LOCAL_ADMIN, BACKEND_MODE } from "./config.js"

const KEY_SESSION = "session"
const KEY_FAILS   = "auth:fails"

const MAX_FAILS = 5
const LOCK_MS   = 60_000 * 5

export const auth = {
  isAuthenticated() {
    const s = storage.read(KEY_SESSION)
    if (!s || !s.exp) return false
    if (Date.now() > s.exp) {
      storage.remove(KEY_SESSION)
      return false
    }
    return true
  },

  user() {
    const s = storage.read(KEY_SESSION)
    return s?.user || null
  },

  async login(username, password) {
    if (BACKEND_MODE === "firebase") {
      return { ok: false, error: "Firebase ainda não configurado" }
    }

    const fails = storage.read(KEY_FAILS, { count: 0, lockedUntil: 0 })
    if (fails.lockedUntil && Date.now() < fails.lockedUntil) {
      return {
        ok: false,
        error: "Muitas tentativas. Tente novamente em alguns minutos.",
        lockedUntil: fails.lockedUntil,
      }
    }

    await new Promise((r) => setTimeout(r, 350))

    const ok =
      username === LOCAL_ADMIN.username && password === LOCAL_ADMIN.password
    if (!ok) {
      const next = { count: (fails.count || 0) + 1, lockedUntil: 0 }
      if (next.count >= MAX_FAILS) {
        next.lockedUntil = Date.now() + LOCK_MS
        next.count = 0
      }
      storage.write(KEY_FAILS, next)
      return { ok: false, error: "Credenciais inválidas." }
    }

    storage.remove(KEY_FAILS)
    const session = {
      user: { username, role: "admin" },
      exp: Date.now() + 1000 * 60 * 60 * 8,
      iat: Date.now(),
    }
    storage.write(KEY_SESSION, session)
    return { ok: true }
  },

  logout() {
    storage.remove(KEY_SESSION)
  },

  requireAuth(loginUrl = "/admin.html") {
    if (!this.isAuthenticated()) {
      location.replace(loginUrl)
      return false
    }
    return true
  },
}