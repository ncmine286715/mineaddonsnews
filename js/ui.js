// =========================================================
// UI shared — preloader, theme, header/nav, footer, reveal, tilt
// =========================================================

import { $, $$ } from "./utils.js"
import { storage } from "./storage.js"
import { SITE } from "./config.js"

// ---------- Theme ----------
export const theme = {
  current() {
    return document.documentElement.getAttribute("data-theme") || SITE.defaultTheme
  },
  apply(name) {
    document.documentElement.setAttribute("data-theme", name)
    storage.write("theme", name)
  },
  toggle() {
    const next = this.current() === "dark" ? "light" : "dark"
    this.apply(next)
    return next
  },
  init() {
    const saved = storage.read("theme") || SITE.defaultTheme
    this.apply(saved)
  },
}

// Init early to avoid FOUC
theme.init()

// ---------- Preloader ----------
export function hidePreloader() {
  const pre = $(".preloader")
  if (!pre) return
  setTimeout(() => pre.classList.add("is-done"), 350)
  setTimeout(() => pre.remove(), 1100)
}

// ---------- Header / Nav ----------
export function mountHeader({ active = "home" } = {}) {
  const links = [
    { id: "home",     label: "Início",       href: "/index.html" },
    { id: "addons",   label: "Addons",       href: "/index.html#addons" },
    { id: "creator",  label: "Meus Addons",  href: "/index.html#creator" },
    { id: "youtube",  label: "YouTube",      href: "/index.html#youtube" },
    { id: "admin",    label: "Admin",        href: "/admin.html" },
  ]

  const html = `
    <header class="topbar" role="banner">
      <div class="container topbar__inner">
        <a href="/index.html" class="brand" aria-label="${SITE.name}">
          <span class="brand__logo"><span>MN</span></span>
          <span class="brand__name">Mine<span>Addons</span></span>
        </a>
        <nav class="nav" aria-label="Navegação principal">
          ${links
            .map(
              (l) =>
                `<a href="${l.href}" data-nav="${l.id}" class="${l.id === active ? "is-active" : ""}">${l.label}</a>`
            )
            .join("")}
        </nav>
        <div class="topbar__actions">
          <button class="theme-toggle" aria-label="Alternar tema" data-action="theme">
            <svg class="icon icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
            <svg class="icon icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
          <a class="btn btn-primary btn-sm" href="/index.html#addons">
            Explorar
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
          <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" data-action="menu">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
      <nav class="mobile-nav" aria-label="Menu mobile">
        ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
      </nav>
    </header>
  `
  const slot = $("#header-slot")
  if (slot) {
    slot.innerHTML = html
  } else {
    document.body.insertAdjacentHTML("afterbegin", html)
  }

  // Theme toggle
  $(".theme-toggle")?.addEventListener("click", () => theme.toggle())

  // Mobile menu
  const toggleBtn = $(".menu-toggle")
  const mobileNav = $(".mobile-nav")
  toggleBtn?.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("is-open")
    toggleBtn.setAttribute("aria-expanded", String(open))
  })
  $$(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", () => mobileNav.classList.remove("is-open"))
  )
}

// ---------- Footer ----------
export function mountFooter() {
  const html = `
    <footer class="footer" role="contentinfo">
      <div class="container footer__grid">
        <div>
          <a href="/index.html" class="brand">
            <span class="brand__logo"><span>MN</span></span>
            <span class="brand__name">Mine<span>Addons</span></span>
          </a>
          <p style="margin-top:1rem;color:var(--text-muted);font-size:.875rem;max-width:320px">
            A central premium de Addons para Minecraft Bedrock. Downloads seguros, atualizações constantes e visual de outro nível.
          </p>
        </div>
        <div>
          <h4>Plataforma</h4>
          <ul>
            <li><a href="/index.html#addons">Addons</a></li>
            <li><a href="/index.html#categories">Categorias</a></li>
            <li><a href="/index.html#creator">Meus Addons</a></li>
            <li><a href="/index.html#trending">Em alta</a></li>
          </ul>
        </div>
        <div>
          <h4>Recursos</h4>
          <ul>
            <li><a href="/index.html#youtube">YouTube</a></li>
            <li><a href="/index.html#security">Segurança</a></li>
            <li><a href="/index.html#tutorial">Como instalar</a></li>
            <li><a href="/admin.html">Admin</a></li>
          </ul>
        </div>
        <div>
          <h4>Conecte-se</h4>
          <ul>
            <li><a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a></li>
            <li><a href="https://discord.com" target="_blank" rel="noopener">Discord</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noopener">TikTok</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer__base">
        <span>© ${new Date().getFullYear()} ${SITE.name}. Não afiliado à Mojang/Microsoft.</span>
        <span class="text-mono">v0.1 · Premium gamer build</span>
      </div>
    </footer>
  `
  const slot = $("#footer-slot")
  if (slot) {
    slot.innerHTML = html
  } else {
    document.body.insertAdjacentHTML("beforeend", html)
  }
}

// ---------- Reveal on scroll ----------
export function initReveal() {
  if (!("IntersectionObserver" in window)) {
    $$("[data-reveal]").forEach((n) => n.classList.add("is-visible"))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible")
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  )
  $$("[data-reveal]").forEach((n) => io.observe(n))
}

// ---------- 3D Tilt em cards ----------
export function initTilt(selector = ".tilt") {
  if (matchMedia("(pointer: coarse)").matches) return
  $$(selector).forEach((card) => {
    let raf = 0
    const onMove = (e) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      const rx = (0.5 - y) * 8
      const ry = (x - 0.5) * 10
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
        card.style.setProperty("--mx", `${x * 100}%`)
        card.style.setProperty("--my", `${y * 100}%`)
      })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      card.style.transform = ""
    }
    card.addEventListener("mousemove", onMove)
    card.addEventListener("mouseleave", reset)
  })
}

// ---------- Counter animation ----------
export function animateCounters(selector = "[data-count]") {
  const els = $$(selector)
  if (!els.length) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const node = e.target
        const target = parseFloat(node.dataset.count)
        const dur = 1400
        const start = performance.now()
        const fmt = node.dataset.format === "k" ? (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : Math.round(n)) : (n) => Math.round(n).toLocaleString("pt-BR")
        function step(t) {
          const p = Math.min((t - start) / dur, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          node.textContent = fmt(target * eased)
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        io.unobserve(node)
      }
    },
    { threshold: 0.4 }
  )
  els.forEach((n) => io.observe(n))
}

// ---------- Topbar shadow on scroll ----------
export function initTopbarShadow() {
  const bar = $(".topbar")
  if (!bar) return
  const onScroll = () => {
    if (scrollY > 8) bar.style.boxShadow = "0 8px 30px rgba(0,0,0,0.35)"
    else bar.style.boxShadow = ""
  }
  addEventListener("scroll", onScroll, { passive: true })
}