// =========================================================
// Modal "verificação de vírus" — gera confiança psicológica.
// Sequência cinematográfica antes de liberar o download.
// =========================================================

import { $, sleep, escapeHtml, safeUrl } from "./utils.js"

const STEPS = [
  "Iniciando scanner Mine Defender™…",
  "Verificando assinatura do arquivo…",
  "Analisando conteúdo (heurística IA)…",
  "Comparando com base de ameaças…",
  "Validando integridade do pacote…",
]

const CHECKS = [
  "Origem verificada",
  "Sem código malicioso",
  "Sem trackers ocultos",
  "Compatibilidade Bedrock",
  "Selo Mine Addons News",
]

function buildModal() {
  const html = `
    <div class="modal-backdrop" id="virus-scan-modal" role="dialog" aria-modal="true" aria-labelledby="scan-title">
      <div class="modal scan-modal">
        <div class="scanner">
          <div class="scanner__circle"></div>
          <div class="scanner__circle"></div>
          <div class="scanner__circle"></div>
          <div class="scanner__beam"></div>
          <div class="scanner__shield">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
        </div>
        <h3 id="scan-title">Verificando arquivo</h3>
        <p class="scan-status" data-scan-status>${STEPS[0]}</p>
        <ul class="scan-checks" data-scan-checks>
          ${CHECKS.map((c) => `<li><span class="check"><svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span><span>${escapeHtml(c)}</span></li>`).join("")}
        </ul>
        <div class="scan-result-safe hidden" data-scan-result>
          <div class="scanner__shield" style="position:relative;color:var(--accent-mc);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;filter:drop-shadow(0 0 8px rgba(61,220,132,0.6))">
              <path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div class="scan-result-safe__title">Arquivo 100% seguro</div>
          <span class="badge badge-mc">Sem vírus · Sem malware</span>
        </div>
        <div class="modal-footer" style="justify-content:center;margin-top:var(--sp-6);">
          <button class="btn btn-ghost btn-sm" data-scan-cancel>Cancelar</button>
          <a class="btn btn-mc hidden" data-scan-download href="#" target="_blank" rel="noopener">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar Addon
          </a>
        </div>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML("beforeend", html)
  return $("#virus-scan-modal")
}

export async function runVirusScan({ url, filename = "addon.mcaddon", onComplete } = {}) {
  let modal = $("#virus-scan-modal") || buildModal()
  const status = modal.querySelector("[data-scan-status]")
  const checks = modal.querySelectorAll("[data-scan-checks] li")
  const result = modal.querySelector("[data-scan-result]")
  const dlBtn  = modal.querySelector("[data-scan-download]")
  const cancel = modal.querySelector("[data-scan-cancel]")

  // Reset state
  checks.forEach((c) => c.classList.remove("is-done"))
  result.classList.add("hidden")
  dlBtn.classList.add("hidden")
  status.textContent = STEPS[0]
  modal.classList.add("is-open")

  let canceled = false
  const close = () => {
    canceled = true
    modal.classList.remove("is-open")
  }
  cancel.onclick = close
  modal.addEventListener("click", (e) => { if (e.target === modal) close() })

  // Run animated steps
  for (let i = 0; i < STEPS.length; i++) {
    if (canceled) return
    status.textContent = STEPS[i]
    await sleep(620 + Math.random() * 280)
    if (checks[i]) checks[i].classList.add("is-done")
  }
  if (canceled) return

  status.textContent = "Análise concluída"
  result.classList.remove("hidden")
  dlBtn.classList.remove("hidden")
  dlBtn.href = safeUrl(url)
  dlBtn.setAttribute("download", filename)
  // Auto-focus pra acessibilidade
  dlBtn.focus()
  if (typeof onComplete === "function") onComplete()

  // Permitir clicar fora pra fechar após scan
  cancel.textContent = "Fechar"
}
