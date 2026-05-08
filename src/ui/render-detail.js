/**
 * RENDER ADDON DETAIL PAGE
 * =====================
 * Renderiza página de detalhes de um addon
 */

import { escapeHTML, formatNumber, renderStars, sanitizeHTML } from '../utils/format.js';
import { state, isFavorite } from '../state/store.js';

/**
 * Constrói HTML da página de detalhes
 * @param {Object} addon - Dados do addon
 * @returns {string} HTML da página de detalhes
 */
export function buildDetailPageHTML(addon) {
  if (!addon || !addon.id) {
    console.warn('⚠️ Addon inválido para detail page:', addon);
    return buildErrorHTML();
  }

  // Escapar dados
  const nome = escapeHTML(addon.nome || 'Sem nome');
  const descricao = escapeHTML(addon.descricao || 'Sem descrição');
  const descricaoCompleta = sanitizeHTML(addon.descricaoCompleta || descricao);
  const categoria = escapeHTML(addon.categoria || 'Geral');
  const versao = escapeHTML(addon.versao || '?');
  const link = escapeHTML(addon.link || '#');
  const addonId = escapeHTML(addon.id);

  const rating = addon.rating || 4;
  const downloads = addon.downloads || 0;
  const stars = renderStars(rating);
  const isFav = isFavorite(addon.id);

  // Construir galeria
  let galleryHTML = '';
  let thumbsHTML = '';

  if (addon.imagens && addon.imagens.length > 0) {
    const mainImg = escapeHTML(addon.imagens[0]);
    galleryHTML = `<img class="gallery-main" id="galleryMain" src="${mainImg}" alt="${nome}">`;

    if (addon.imagens.length > 1) {
      thumbsHTML = '<div class="gallery-thumbs">';
      addon.imagens.forEach((img, i) => {
        const escapedImg = escapeHTML(img);
        const activeClass = i === 0 ? 'active' : '';
        thumbsHTML += `<img class="gallery-thumb ${activeClass}" src="${escapedImg}" onclick="changeGalleryImage('${escapedImg}', this)" loading="lazy">`;
      });
      thumbsHTML += '</div>';
    }
  } else {
    galleryHTML = '<div class="gallery-main" style="display:flex;align-items:center;justify-content:center;font-size:5rem;">🧩</div>';
  }

  // Construir guia de instalação
  let installHTML = '';
  if (addon.instrucoes) {
    const steps = addon.instrucoes.split('\n').filter(Boolean);
    if (steps.length > 0) {
      installHTML = '<div class="install-guide"><h3>📌 Como instalar</h3>';
      steps.forEach((step, i) => {
        const escapedStep = escapeHTML(step);
        installHTML += `
          <div class="install-step">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${escapedStep}</div>
          </div>
        `;
      });
      installHTML += '</div>';
    }
  }

  // Se não houver instruções, usar padrão
  if (!installHTML) {
    installHTML = `
      <div class="install-guide">
        <h3>📌 Como instalar</h3>
        <div class="install-step">
          <div class="step-num">1</div>
          <div class="step-text">Clique em "Baixar Addon" acima</div>
        </div>
        <div class="install-step">
          <div class="step-num">2</div>
          <div class="step-text">Abra o arquivo .mcaddon/.mcpack baixado</div>
        </div>
        <div class="install-step">
          <div class="step-num">3</div>
          <div class="step-text">O Minecraft importará automaticamente</div>
        </div>
        <div class="install-step">
          <div class="step-num">4</div>
          <div class="step-text">Ative o addon nas configurações do mundo</div>
        </div>
      </div>
    `;
  }

  // Construir HTML final
  return `
    <button class="detail-close" onclick="closeDetail()">✕</button>
    <div class="detail-gallery">
      ${galleryHTML}
      ${thumbsHTML}
    </div>
    <div class="detail-header">
      <h1 class="detail-title">${nome}</h1>
      <div class="detail-meta-row">
        <span class="meta-tag">📦 ${categoria}</span>
        <span class="meta-tag">📱 v${versao}</span>
        <span class="meta-tag" id="download-count-detail">⬇️ ${formatNumber(downloads)} downloads</span>
        <div class="detail-rating-stars">${stars}</div>
      </div>
    </div>
    <div class="detail-actions">
      <a href="${link}" target="_blank" class="dl-btn-big" onclick="trackDownload('${addonId}', event)">
        <div style="display:flex; flex-direction:column; align-items:center;">
          <span>⬇️ BAIXAR AGORA — GRÁTIS</span>
          <span class="dl-btn-subtext">Sem cadastro necessário • Download imediato</span>
        </div>
      </a>
      <button class="action-btn" onclick="shareAddon('${addonId}', '${nome.replace(/'/g, "\\'")}')">📤 Compartilhar</button>
      <button class="action-btn" onclick="copyLink('${link}')">📋 Copiar link</button>
      <button class="action-btn" onclick="toggleFavorite('${addonId}')">${isFav ? '❤️ Favoritado' : '🤍 Favoritar'}</button>
    </div>
    <div class="detail-description">
      <h3>📖 Sobre este addon</h3>
      <p>${descricaoCompleta.replace(/\n/g, '<br>')}</p>
    </div>
    ${installHTML}
  `;
}

/**
 * Constrói HTML de erro
 * @returns {string} HTML de erro
 */
function buildErrorHTML() {
  return `
    <button class="detail-close" onclick="closeDetail()">✕</button>
    <div class="detail-error">
      <h2>❌ Erro ao carregar addon</h2>
      <p>Não foi possível carregar os dados do addon. Tente novamente.</p>
      <button onclick="closeDetail()" class="action-btn">Voltar</button>
    </div>
  `;
}

/**
 * Constrói HTML da galeria de imagens
 * @param {Array<string>} imagens - Array de URLs de imagens
 * @returns {string} HTML da galeria
 */
export function buildGalleryHTML(imagens) {
  if (!imagens || imagens.length === 0) {
    return '<div class="gallery-main" style="display:flex;align-items:center;justify-content:center;font-size:5rem;">🧩</div>';
  }

  let html = `<img class="gallery-main" id="galleryMain" src="${escapeHTML(imagens[0])}" alt="Imagem principal">`;

  if (imagens.length > 1) {
    html += '<div class="gallery-thumbs">';
    imagens.forEach((img, i) => {
      const activeClass = i === 0 ? 'active' : '';
      html += `<img class="gallery-thumb ${activeClass}" src="${escapeHTML(img)}" onclick="changeGalleryImage('${escapeHTML(img)}', this)" loading="lazy">`;
    });
    html += '</div>';
  }

  return html;
}
