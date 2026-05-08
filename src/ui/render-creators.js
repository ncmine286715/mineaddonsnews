/**
 * RENDER CREATORS
 * =====================
 * Funções para renderizar seção de criadores
 */

import { escapeHTML, sanitizeHTML } from '../utils/format.js';
import { state } from '../state/store.js';

/**
 * Constrói HTML de um card de criador
 * @param {Object} creator - Dados do criador
 * @returns {string} HTML do card
 */
export function buildCreatorCardHTML(creator) {
  if (!creator || !creator.slug) {
    console.warn('⚠️ Criador inválido:', creator);
    return '';
  }

  const nome = escapeHTML(creator.nome || 'Sem nome');
  const descricao = escapeHTML(creator.descricao || '');
  const slug = escapeHTML(creator.slug);
  const verified = creator.verificado ? '<span class="verified-badge" title="Criador Verificado">✔</span>' : '';

  let imgHTML = '';
  if (creator.foto) {
    const foto = escapeHTML(creator.foto);
    imgHTML = `<img class="creator-card-img" src="${foto}" alt="${nome}" onerror="this.src='https://via.placeholder.com/70?text=👤'">`;
  } else {
    imgHTML = '<div class="creator-card-img">👤</div>';
  }

  return `
    <div class="creator-card" onclick="openCreatorPage('${slug}')">
      ${imgHTML}
      <div class="creator-card-name">${nome} ${verified}</div>
      <div class="creator-card-desc">${descricao}</div>
    </div>
  `;
}

/**
 * Constrói HTML da página de criador
 * @param {Object} creator - Dados do criador
 * @returns {string} HTML da página
 */
export function buildCreatorPageHTML(creator) {
  if (!creator || !creator.slug) {
    console.warn('⚠️ Criador inválido para página:', creator);
    return buildCreatorErrorHTML();
  }

  const nome = escapeHTML(creator.nome || 'Sem nome');
  const descricao = escapeHTML(creator.descricao || '');
  const slug = escapeHTML(creator.slug);
  const verified = creator.verificado ? '<span class="verified-badge" title="Criador Verificado">✔</span>' : '';

  // Construir avatar
  let avatarHTML = '';
  if (creator.foto) {
    const foto = escapeHTML(creator.foto);
    avatarHTML = `<img src="${foto}" onerror="this.src='https://via.placeholder.com/120?text=👤'">`;
  } else {
    avatarHTML = '<div style="font-size: 3rem;">👤</div>';
  }

  // Construir links sociais
  let socialLinksHTML = '';
  if (creator.links && Object.keys(creator.links).length > 0) {
    socialLinksHTML = '<div class="creator-social-links">';
    
    if (creator.links.youtube) {
      const url = escapeHTML(creator.links.youtube);
      socialLinksHTML += `<a href="${url}" target="_blank" class="social-btn yt">▶ YouTube</a>`;
    }
    if (creator.links.twitter) {
      const url = escapeHTML(creator.links.twitter);
      socialLinksHTML += `<a href="${url}" target="_blank" class="social-btn tw">𝕏 Twitter</a>`;
    }
    if (creator.links.discord) {
      const url = escapeHTML(creator.links.discord);
      socialLinksHTML += `<a href="${url}" target="_blank" class="social-btn dc">👾 Discord</a>`;
    }
    if (creator.links.website) {
      const url = escapeHTML(creator.links.website);
      socialLinksHTML += `<a href="${url}" target="_blank" class="social-btn web">🌐 Site</a>`;
    }
    
    socialLinksHTML += '</div>';
  }

  // Construir addons do criador
  let addonsHTML = '';
  if (creator.addons && creator.addons.length > 0) {
    const creatorAddons = state.addons.filter(a => creator.addons.includes(a.id));
    
    if (creatorAddons.length > 0) {
      addonsHTML = creatorAddons.map(a => {
        const addonNome = escapeHTML(a.nome || 'Sem nome');
        const addonCategoria = escapeHTML(a.categoria || 'Geral');
        const addonId = escapeHTML(a.id);
        let addonImg = '';

        if (a.imagens && a.imagens.length > 0) {
          addonImg = `<img src="${escapeHTML(a.imagens[0])}" onerror="this.src='https://via.placeholder.com/100?text=Addon'">`;
        } else {
          addonImg = '<div style="background: #ccc; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">🧩</div>';
        }

        return `
          <div class="creator-addon-card" onclick="openDetailFromCreator('${addonId}')">
            ${addonImg}
            <div class="creator-addon-info">
              <h4>${addonNome}</h4>
              <p>${addonCategoria}</p>
            </div>
            <span class="creator-addon-arrow">➔</span>
          </div>
        `;
      }).join('');
    } else {
      addonsHTML = '<p style="text-align:center;color:#666;margin-top:2rem;">Nenhum addon em destaque.</p>';
    }
  } else {
    addonsHTML = '<p style="text-align:center;color:#666;margin-top:2rem;">Nenhum addon em destaque.</p>';
  }

  return `
    <button class="detail-close" onclick="closeCreatorPage()">✕</button>
    <div class="creator-profile">
      <div class="creator-avatar">
        ${avatarHTML}
      </div>
      <h1 class="creator-name">${nome} ${verified}</h1>
      <p class="creator-bio">${descricao}</p>
      ${socialLinksHTML}
    </div>
    <div class="creator-links">
      <h3 class="creator-section-title">Addons em Destaque</h3>
      ${addonsHTML}
    </div>
    <div class="creator-footer">
      <p>Powered by Mineaddonsnews</p>
    </div>
  `;
}

/**
 * Constrói HTML de erro para página de criador
 * @returns {string} HTML de erro
 */
function buildCreatorErrorHTML() {
  return `
    <button class="detail-close" onclick="closeCreatorPage()">✕</button>
    <div class="creator-error">
      <h2>❌ Erro ao carregar criador</h2>
      <p>Não foi possível carregar os dados do criador. Tente novamente.</p>
      <button onclick="closeCreatorPage()" class="action-btn">Voltar</button>
    </div>
  `;
}

/**
 * Constrói HTML da seção de criadores
 * @returns {string} HTML da seção
 */
export function buildCreatorsSectionHTML() {
  if (!state.creators || state.creators.length === 0) {
    return '';
  }

  let html = '<div class="creators-grid">';
  state.creators.forEach(creator => {
    html += buildCreatorCardHTML(creator);
  });
  html += '</div>';

  return html;
}
