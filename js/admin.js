/**
 * admin.js — painel administrativo (CRUD de addons + meus links)
 */
import { DB } from "./db.js"
import { auth } from "./auth.js"
import { toast } from "./toast.js"
import { $, $$, slugify, formatDate } from "./utils.js"

// Inicializa DB
DB.init()

const state = {
  view: "dashboard",
  editingAddon: null,
}

/* ---------- Login ---------- */
function renderLogin() {
  const root = $("#admin-root")
  root.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-card__head">
          <div class="brand">
            <span class="brand__logo"><span>MN</span></span>
            <span class="brand__name">Mine<span>Addons</span> <strong>Admin</strong></span>
          </div>
          <h1>Acesso restrito</h1>
          <p class="muted">Entre com suas credenciais para gerenciar o conteúdo.</p>
        </div>
        <form id="login-form" class="auth-form">
          <label class="field">
            <span>Usuário</span>
            <input type="text" name="username" required autocomplete="username" class="input" />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="password" required autocomplete="current-password" class="input" />
          </label>
          <button class="btn btn-primary btn-block" type="submit">Entrar</button>
        </form>
        <p class="auth-hint">
          Padrão: <code>admin</code> / <code>minecraft</code> — troque depois nas configurações.
        </p>
        <a class="btn btn-ghost btn-sm" href="/" style="margin-top:1rem;display:block;text-align:center;">← Voltar para o site</a>
      </div>
    </div>
  `
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const result = await auth.login(fd.get("username"), fd.get("password"))
    if (result.ok) {
      toast.success("Bem-vindo de volta!")
      renderShell()
    } else {
      toast.error(result.error || "Credenciais inválidas")
    }
  })
}

/* ---------- Shell ---------- */
function renderShell() {
  const root = $("#admin-root")
  root.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="brand admin-brand" style="padding:1rem;">
          <span class="brand__logo"><span>MN</span></span>
          <span class="brand__name">Mine<span>Addons</span></span>
        </div>
        <nav class="admin-nav">
          <button data-view="dashboard" class="is-active">
            <span>▦</span> Dashboard
          </button>
          <button data-view="addons">
            <span>▣</span> Addons
          </button>
          <button data-view="links">
            <span>↗</span> Meus Links
          </button>
          <button data-view="settings">
            <span>⚙</span> Configurações
          </button>
        </nav>
        <div class="admin-sidebar__foot">
          <a href="/" class="muted small">Ver site →</a>
          <button id="logout" class="btn btn-ghost btn-sm" style="margin-top:0.5rem;">Sair</button>
        </div>
      </aside>
      <main class="admin-main" id="admin-main"></main>
    </div>
  `

  $$(".admin-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view
      updateNav()
      renderView()
    })
  })

  $("#logout").addEventListener("click", () => {
    auth.logout()
    toast.info("Sessão encerrada")
    renderLogin()
  })

  updateNav()
  renderView()
}

function updateNav() {
  $$(".admin-nav button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === state.view)
  })
}

/* ---------- Views ---------- */
function renderView() {
  const main = $("#admin-main")
  if (state.view === "dashboard") return renderDashboard(main)
  if (state.view === "addons") return state.editingAddon ? renderAddonForm(main) : renderAddonsList(main)
  if (state.view === "links") return renderLinks(main)
  if (state.view === "settings") return renderSettings(main)
}

function renderDashboard(main) {
  const addons = DB.addons.all()
  const links = DB.links.list()
  const featured = addons.filter((a) => a.featuredCreator).length
  const totalDownloads = addons.reduce((sum, a) => sum + (a.downloads || 0), 0)

  main.innerHTML = `
    <header class="admin-page-head">
      <div>
        <h1>Dashboard</h1>
        <p class="muted">Visão geral do conteúdo publicado.</p>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__label">Addons</span>
        <span class="stat-card__value">${addons.length}</span>
        <span class="stat-card__delta">${featured} em destaque</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Downloads totais</span>
        <span class="stat-card__value">${totalDownloads.toLocaleString("pt-BR")}</span>
        <span class="stat-card__delta">Soma de cliques</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Links na bio</span>
        <span class="stat-card__value">${links.length}</span>
        <span class="stat-card__delta">Linktree gamer</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Ações rápidas</span>
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
          <button class="btn btn-primary btn-sm" data-quick="new-addon">+ Novo addon</button>
          <button class="btn btn-ghost btn-sm" data-quick="new-link">+ Novo link</button>
        </div>
      </div>
    </div>

    <section class="admin-section">
      <header class="section-head">
        <h2>Últimos addons</h2>
        <button class="btn btn-ghost btn-sm" data-quick="goto-addons">Ver todos →</button>
      </header>
      <div class="table-wrap">
        ${renderAddonsTable(addons.slice(0, 5))}
      </div>
    </section>
  `

  main.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.quick
      if (action === "new-addon") {
        state.view = "addons"
        state.editingAddon = blankAddon()
        renderView()
        updateNav()
      } else if (action === "new-link") {
        state.view = "links"
        renderView()
        updateNav()
      } else if (action === "goto-addons") {
        state.view = "addons"
        renderView()
        updateNav()
      }
    })
  })

  bindAddonRowActions(main)
}

function renderAddonsTable(addons) {
  if (!addons.length) {
    return `<div class="admin-empty">Nenhum addon ainda. Clique em <strong>+ Novo addon</strong> para começar.</div>`
  }
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Versão</th>
          <th>Downloads</th>
          <th>Atualizado</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${addons
          .map(
            (a) => `
          <tr>
            <td>
              <div class="cell-title">
                <img class="table__thumb" src="${a.image || ""}" alt="" />
                <div>
                  <span class="table__title">${a.title}</span>
                  <small class="muted">/${a.slug}</small>
                </div>
              </div>
            </td>
            <td>${a.version || "—"}</td>
            <td>${(a.downloads || 0).toLocaleString("pt-BR")}</td>
            <td>${formatDate(a.updatedAt)}</td>
            <td>
              ${a.featuredCreator ? '<span class="badge badge-prem">Destaque</span>' : '<span class="badge">Publicado</span>'}
            </td>
            <td class="table__actions">
              <button class="btn btn-ghost btn-xs" data-edit="${a.id}">Editar</button>
              <button class="btn btn-ghost btn-xs btn-danger" data-delete="${a.id}">Excluir</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `
}

function bindAddonRowActions(scope) {
  scope.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const addon = DB.addons.byId(btn.dataset.edit)
      if (addon) {
        state.editingAddon = { ...addon }
        state.view = "addons"
        renderView()
        updateNav()
      }
    })
  })
  scope.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Excluir este addon? Esta ação não pode ser desfeita.")) {
        DB.addons.remove(btn.dataset.delete)
        toast.success("Addon excluído")
        renderView()
      }
    })
  })
}

function renderAddonsList(main) {
  const addons = DB.addons.all()
  main.innerHTML = `
    <header class="admin-page-head">
      <div>
        <h1>Addons</h1>
        <p class="muted">Gerencie todos os addons publicados.</p>
      </div>
      <button id="new-addon" class="btn btn-primary">+ Novo addon</button>
    </header>

    <div class="table-wrap">
      ${renderAddonsTable(addons)}
    </div>
  `
  $("#new-addon").addEventListener("click", () => {
    state.editingAddon = blankAddon()
    renderView()
  })
  bindAddonRowActions(main)
}

function blankAddon() {
  return {
    id: null,
    slug: "",
    title: "",
    description: "",
    image: "",
    banner: "",
    download: "",
    version: "1.0.0",
    compat: "1.21+",
    category: "Magia",
    tags: [],
    featuredCreator: false,
    downloads: 0,
    rating: 0,
    premium: false,
    author: "Mine Addons News",
    longDescription: "",
    changelog: [],
  }
}

function renderAddonForm(main) {
  const a = state.editingAddon
  const isNew = !a.id
  main.innerHTML = `
    <header class="admin-page-head">
      <div>
        <h1>${isNew ? "Novo addon" : "Editar addon"}</h1>
        <p class="muted">${isNew ? "Preencha as informações do novo addon." : `Editando: ${a.title}`}</p>
      </div>
      <div>
        <button id="cancel" class="btn btn-ghost">Cancelar</button>
        <button id="save" class="btn btn-primary">Salvar</button>
      </div>
    </header>

    <form id="addon-form" class="form-grid">
      <div class="field">
        <label>Título *</label>
        <input class="input" name="title" required value="${escapeAttr(a.title)}" />
      </div>
      <div class="field">
        <label>Slug *</label>
        <input class="input" name="slug" required value="${escapeAttr(a.slug)}" placeholder="meu-addon-incrivel" />
        <small class="muted">URL: /addon.html?slug=<strong id="slug-preview">${a.slug || "..."}</strong></small>
      </div>
      <div class="field field--full">
        <label>Descrição</label>
        <textarea class="textarea" name="description" rows="4">${escapeAttr(a.description)}</textarea>
      </div>
      <div class="field">
        <label>Imagem (URL)</label>
        <input class="input" name="image" value="${escapeAttr(a.image)}" placeholder="https://..." />
      </div>
      <div class="field">
        <label>Banner (URL)</label>
        <input class="input" name="banner" value="${escapeAttr(a.banner)}" placeholder="https://..." />
      </div>
      <div class="field">
        <label>Versão</label>
        <input class="input" name="version" value="${escapeAttr(a.version)}" />
      </div>
      <div class="field">
        <label>Compatibilidade</label>
        <input class="input" name="compat" value="${escapeAttr(a.compat)}" placeholder="1.21+" />
      </div>
      <div class="field">
        <label>Categoria</label>
        <select class="select" name="category">
          ${["Magia", "Tecnologia", "Armas", "Mobs", "Estruturas", "Shaders", "Texturas", "Utilidades"]
            .map((c) => `<option ${c === a.category ? "selected" : ""}>${c}</option>`)
            .join("")}
        </select>
      </div>
      <div class="field">
        <label>Tags (separadas por vírgula)</label>
        <input class="input" name="tags" value="${(a.tags || []).join(", ")}" />
      </div>
      <div class="field field--full">
        <label>URL de download *</label>
        <input class="input" name="download" required value="${escapeAttr(a.download)}" placeholder="https://..." />
      </div>
      <div class="field field--full toggle-row">
        <span>Destaque (Meus Addons)</span>
        <label class="switch ${a.featuredCreator ? "is-on" : ""}" id="featured-switch">
          <input type="checkbox" name="featured" ${a.featuredCreator ? "checked" : ""} hidden />
        </label>
      </div>
      <div class="field field--full" style="display:flex;gap:1rem;justify-content:flex-end;">
        <button type="button" id="cancel" class="btn btn-ghost">Cancelar</button>
        <button type="submit" id="save" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `

  // auto-slug
  const titleInput = main.querySelector('[name="title"]')
  const slugInput = main.querySelector('[name="slug"]')
  const slugPreview = $("#slug-preview")
  let slugTouched = !!a.slug
  slugInput.addEventListener("input", () => {
    slugTouched = true
    slugPreview.textContent = slugInput.value || "..."
  })
  titleInput.addEventListener("input", () => {
    if (!slugTouched) {
      slugInput.value = slugify(titleInput.value)
      slugPreview.textContent = slugInput.value || "..."
    }
  })

  // Toggle switch
  const switchEl = $("#featured-switch")
  switchEl.addEventListener("click", () => {
    switchEl.classList.toggle("is-on")
    const cb = switchEl.querySelector("input")
    cb.checked = !cb.checked
  })

  main.querySelector("#cancel").addEventListener("click", () => {
    state.editingAddon = null
    renderView()
  })

  main.querySelector("#addon-form").addEventListener("submit", (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = {
      ...a,
      title: fd.get("title").trim(),
      slug: fd.get("slug").trim(),
      description: fd.get("description").trim(),
      image: fd.get("image").trim(),
      banner: fd.get("banner").trim(),
      version: fd.get("version").trim(),
      compat: fd.get("compat").trim(),
      category: fd.get("category"),
      tags: fd.get("tags").split(",").map((t) => t.trim()).filter(Boolean),
      download: fd.get("download").trim(),
      featuredCreator: switchEl.classList.contains("is-on"),
    }
    if (!payload.title || !payload.slug || !payload.download) {
      toast.error("Preencha título, slug e URL de download")
      return
    }
    if (a.id) {
      DB.addons.update(a.id, payload)
      toast.success("Addon atualizado")
    } else {
      DB.addons.create(payload)
      toast.success("Addon criado")
    }
    state.editingAddon = null
    renderView()
  })
}

/* ---------- Links ---------- */
function renderLinks(main) {
  const links = DB.links.list()
  main.innerHTML = `
    <header class="admin-page-head">
      <div>
        <h1>Meus Links</h1>
        <p class="muted">Linktree gamer da sua bio.</p>
      </div>
      <button id="add-link" class="btn btn-primary">+ Novo link</button>
    </header>

    <div class="table-wrap" id="links-board">
      ${links.length ? links.map(linkRow).join("") : `<div class="admin-empty">Nenhum link ainda.</div>`}
    </div>
  `

  $("#add-link").addEventListener("click", () => addLinkPrompt())
  bindLinkActions(main)
}

function linkRow(l) {
  return `
    <div class="link-row" data-id="${l.id}" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border-bottom:1px solid var(--surface-line);">
      <div>
        <strong>${l.label}</strong>
        <small class="muted">${l.url}</small>
      </div>
      <div class="link-actions" style="display:flex;gap:0.5rem;">
        <button class="btn btn-ghost btn-xs" data-up>↑</button>
        <button class="btn btn-ghost btn-xs" data-down>↓</button>
        <button class="btn btn-ghost btn-xs" data-edit-link>Editar</button>
        <button class="btn btn-ghost btn-xs btn-danger" data-del-link>Excluir</button>
      </div>
    </div>
  `
}

function bindLinkActions(scope) {
  scope.querySelectorAll("[data-edit-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".link-row").dataset.id
      editLinkPrompt(id)
    })
  })
  scope.querySelectorAll("[data-del-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".link-row").dataset.id
      if (confirm("Excluir este link?")) {
        DB.links.remove(id)
        toast.success("Link excluído")
        renderView()
      }
    })
  })
  scope.querySelectorAll("[data-up]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".link-row").dataset.id
      DB.links.move(id, -1)
      renderView()
    })
  })
  scope.querySelectorAll("[data-down]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".link-row").dataset.id
      DB.links.move(id, 1)
      renderView()
    })
  })
}

function addLinkPrompt() {
  const label = prompt("Texto do link (ex: YouTube, Discord, TikTok):")
  if (!label) return
  const url = prompt("URL do link:")
  if (!url) return
  const icon = prompt("Ícone (opcional, ex: youtube, discord, tiktok):") || ""
  DB.links.create({ label, url, icon })
  toast.success("Link adicionado")
  renderView()
}

function editLinkPrompt(id) {
  const link = DB.links.get(id)
  if (!link) return
  const label = prompt("Texto do link:", link.label)
  if (label === null) return
  const url = prompt("URL:", link.url)
  if (url === null) return
  DB.links.update(id, { label, url })
  toast.success("Link atualizado")
  renderView()
}

/* ---------- Settings ---------- */
function renderSettings(main) {
  main.innerHTML = `
    <header class="admin-page-head">
      <div>
        <h1>Configurações</h1>
        <p class="muted">Backend, branding e dados.</p>
      </div>
    </header>

    <div class="settings-card">
      <h3>Backend</h3>
      <p class="muted small">Esta versão usa <strong>localStorage</strong> como fallback. Para ativar Firebase + GitHub Database, edite <code>js/config.js</code> e preencha as chaves.</p>
      <ul class="check-list">
        <li class="ok">localStorage ativo</li>
        <li class="off">Firebase (configurar em config.js)</li>
        <li class="off">GitHub Database (configurar em config.js)</li>
      </ul>
    </div>

    <div class="settings-card">
      <h3>Dados</h3>
      <p class="muted small">Exporte ou importe um backup completo (addons + links).</p>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button id="export-data" class="btn btn-ghost btn-sm">Exportar JSON</button>
        <button id="import-data" class="btn btn-ghost btn-sm">Importar JSON</button>
        <button id="seed-data" class="btn btn-ghost btn-sm">Resetar com demo</button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Sobre</h3>
      <p class="muted small">Mine Addons News v1.0 — site estático modular em HTML/CSS/JS puro.</p>
    </div>
  `

  $("#export-data").addEventListener("click", () => {
    const blob = new Blob([DB.exportAll()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mine-addons-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Backup exportado")
  })

  $("#import-data").addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        DB.importAll(data)
        toast.success("Backup importado")
        renderView()
      } catch {
        toast.error("Arquivo inválido")
      }
    }
    input.click()
  })

  $("#seed-data").addEventListener("click", () => {
    if (confirm("Resetar todos os dados e popular com exemplos? Isto sobrescreve o que existe.")) {
      DB.seed(true)
      toast.success("Dados resetados")
      renderView()
    }
  })
}

/* ---------- helpers ---------- */
function escapeAttr(v) {
  return String(v ?? "").replace(/"/g, "&quot;")
}

/* ---------- boot ---------- */
if (auth.isAuthenticated()) {
  renderShell()
} else {
  renderLogin()
}