// =========================================================
// Página individual do Addon (/addon.html?slug=...)
// =========================================================

import { $, $$, getQuery, escapeHtml, formatNumber, formatDate, placeholderImg, copyToClipboard } from "./utils.js"
import { DB } from "./db.js"
import { mountHeader, mountFooter, initReveal, initTopbarShadow, hidePreloader } from "./ui.js"
import { runVirusScan } from "./virus-scan.js"
import { toast } from "./toast.js"
import { renderAddonGrid } from "./addon-card.js"

DB.init()

function notFound() {
  $("#addon-root").innerHTML = `
    <div class="container section">
      <div class="empty-state">
        <h3>Addon não encontrado</h3>
        <p>O addon que você procura não existe ou foi removido.</p>
        <a class="btn btn-primary" href="/index.html" style="margin-top:1.5rem">Voltar à home</a>
      </div>
    </div>
  `
}

function render(addon) {
  // SEO
  document.title = `${addon.title} · Mine Addons News`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) metaDesc.setAttribute("content", addon.description?.slice(0, 160) || "")

  const banner = addon.banner || addon.image || placeholderImg(addon.title)
  const image  = addon.image || banner

  const html = `
    <div class="container addon-page page-in">
      <nav class="breadcrumbs" aria-label="breadcrumbs">
        <a href="/index.html">Início</a>
        <span class="sep">/</span>
        <a href="/index.html#addons">Addons</a>
        <span class="sep">/</span>
        <span>${escapeHtml(addon.title)}</span>
      </nav>

      <article class="addon-hero" data-reveal="fade">
        <div class="addon-hero__banner">
          <img src="${escapeHtml(banner)}" alt="${escapeHtml(addon.title)}" />
        </div>
        <div class="addon-hero__body">
          <div>
            <div class="addon-hero__cat">${escapeHtml(addon.category)}</div>
            <h1 class="addon-hero__title">${escapeHtml(addon.title)}</h1>
            <p>${escapeHtml(addon.description)}</p>
            <div class="addon-hero__meta">
              <span><svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> <strong>${formatNumber(addon.downloads || 0)}</strong> downloads</span>
              <span><svg class="icon icon-sm" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> <strong>${(addon.rating || 0).toFixed(1)}</strong></span>
              <span><svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <strong>${formatDate(addon.updatedAt)}</strong></span>
              ${addon.premium ? `<span class="badge badge-prem"><svg class="icon icon-sm" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Premium</span>` : ""}
            </div>
          </div>
          <div class="addon-hero__actions">
            <button class="btn btn-mc btn-lg" data-action="download">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar Addon
            </button>
            <button class="btn btn-ghost" data-action="share">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Compartilhar
            </button>
          </div>
        </div>
      </article>

      <div class="addon-grid">
        <div class="addon-content">
          <section data-reveal>
            <h2>Sobre o Addon</h2>
            <p>${escapeHtml(addon.longDescription || addon.description)}</p>
          </section>

          ${addon.tags?.length ? `
          <section data-reveal>
            <h2>Tags</h2>
            <div class="tags">${addon.tags.map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join("")}</div>
          </section>` : ""}

          <section data-reveal>
            <h2>Como instalar</h2>
            <p style="color:var(--text-secondary);line-height:1.7">
              1. Clique em <strong>Baixar Addon</strong> e aguarde a verificação de segurança.<br>
              2. Abra o arquivo <code class="text-mono">.mcaddon</code>/<code class="text-mono">.mcpack</code> — o Minecraft Bedrock importa automaticamente.<br>
              3. Crie um novo mundo, ative o pacote em <strong>Behavior Packs</strong>/<strong>Resource Packs</strong> e divirta-se.
            </p>
          </section>

          ${addon.changelog?.length ? `
          <section data-reveal>
            <h2>Changelog</h2>
            <div class="changelog">
              ${addon.changelog.map((c) => `
                <div class="changelog__item">
                  <div class="changelog__version">v${escapeHtml(c.version)}</div>
                  <div class="changelog__date">${escapeHtml(c.date)}</div>
                  <ul class="changelog__list">
                    ${(c.notes || []).map((n) => `<li>${escapeHtml(n)}</li>`).join("")}
                  </ul>
                </div>
              `).join("")}
            </div>
          </section>` : ""}
        </div>

        <aside class="addon-sidebar">
          <div class="info-card">
            <h3>Informações</h3>
            <div class="info-row"><span>Versão</span><span class="text-mono">${escapeHtml(addon.version)}</span></div>
            <div class="info-row"><span>Compatibilidade</span><span class="text-mono">${escapeHtml(addon.compat)}</span></div>
            <div class="info-row"><span>Categoria</span><span>${escapeHtml(addon.category)}</span></div>
            <div class="info-row"><span>Atualizado</span><span>${formatDate(addon.updatedAt)}</span></div>
            <div class="info-row"><span>Downloads</span><span>${formatNumber(addon.downloads || 0)}</span></div>
          </div>

          <div class="info-card">
            <h3>Autor</h3>
            <div class="author">
              <div class="author__avatar">${escapeHtml((addon.author || "MN").slice(0, 2).toUpperCase())}</div>
              <div>
                <div class="author__name">${escapeHtml(addon.author || "Mine Addons News")}</div>
                <div class="author__role">Criador verificado</div>
              </div>
            </div>
          </div>

          <div class="info-card" style="background:linear-gradient(135deg, rgba(61,220,132,0.08), rgba(0,212,255,0.08)); border-color: rgba(61,220,132,0.3);">
            <h3 style="color: var(--accent-mc)">Selo de Segurança</h3>
            <p style="font-size:.85rem; color:var(--text-secondary); margin-bottom: var(--sp-3);">
              Todos os addons passam por escaneamento Mine Defender™ antes do download.
            </p>
            <div style="display:flex; gap:.5rem; flex-wrap:wrap">
              <span class="badge badge-mc">100% seguro</span>
              <span class="badge">Sem trackers</span>
            </div>
          </div>
        </aside>
      </div>

      <section class="section" data-reveal>
        <div class="section-head">
          <div>
            <div class="section-head__eyebrow">Você também vai curtir</div>
            <h2>Addons similares</h2>
          </div>
        </div>
        <div class="addons-grid" id="related-grid"></div>
      </section>
    </div>
  `

  $("#addon-root").innerHTML = html

  // Related
  const related = DB.addons.byCategory(addon.category).filter((a) => a.id !== addon.id).slice(0, 4)
  $("#related-grid").innerHTML = renderAddonGrid(related)

  // Download
  $('[data-action="download"]').addEventListener("click", () => {
    const filename = `${addon.slug}.mcaddon`
    runVirusScan({
      url: addon.download,
      filename,
      onComplete: () => {
        DB.addons.incrementDownloads(addon.id)
      },
    })
  })

  // Share
  $('[data-action="share"]').addEventListener("click", async () => {
    const shareData = {
      title: `${addon.title} · Mine Addons News`,
      text: addon.description,
      url: location.href,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      const ok = await copyToClipboard(location.href)
      if (ok) toast.success("Link copiado!")
      else    toast.error("Falha ao copiar")
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  mountHeader({ active: "addons" })

  const slug = getQuery("slug") || getQuery("id")
  const addon = slug ? (DB.addons.bySlug(slug) || DB.addons.byId(slug)) : null
  if (!addon) notFound()
  else render(addon)

  mountFooter()
  initReveal()
  initTopbarShadow()
  hidePreloader()
})