/**
 * ROUTER
 * =====================
 * Gerencia roteamento baseado em hash (#/addon/id, #/criador/slug)
 */

import { state, updateState } from '../state/store.js';

/**
 * Tipos de rotas suportadas
 */
export const ROUTES = {
  HOME: '/',
  ADDON_DETAIL: '/addon/:id',
  CREATOR_PAGE: '/criador/:slug'
};

/**
 * Inicializa o router
 */
export function initializeRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  
  // Processar rota inicial
  handleRouteChange();
  
  console.log('✅ Router inicializado');
}

/**
 * Processa mudança de rota
 */
function handleRouteChange() {
  const hash = window.location.hash;
  
  if (hash.startsWith('#/addon/')) {
    const id = hash.replace('#/addon/', '');
    handleAddonDetail(id);
  } else if (hash.startsWith('#/criador/')) {
    const slug = hash.replace('#/criador/', '');
    handleCreatorPage(slug);
  } else {
    handleHome();
  }
}

/**
 * Abre página de detalhes de um addon
 * @param {string} addonId - ID do addon
 */
function handleAddonDetail(addonId) {
  const addon = state.addons.find(a => a.id === addonId);
  
  if (addon) {
    updateState('currentDetailAddon', addon);
    updateState('isDetailOpen', true);
    console.log(`📖 Abrindo addon: ${addon.nome}`);
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('addonDetailOpened', { detail: addon }));
  } else {
    console.warn(`⚠️ Addon não encontrado: ${addonId}`);
    goHome();
  }
}

/**
 * Abre página de criador
 * @param {string} slug - Slug do criador
 */
function handleCreatorPage(slug) {
  const creator = state.creators.find(c => c.slug === slug);
  
  if (creator) {
    updateState('currentCreatorPage', creator);
    updateState('isCreatorPageOpen', true);
    console.log(`👥 Abrindo criador: ${creator.nome}`);
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('creatorPageOpened', { detail: creator }));
  } else {
    console.warn(`⚠️ Criador não encontrado: ${slug}`);
    goHome();
  }
}

/**
 * Volta para home
 */
function handleHome() {
  updateState('isDetailOpen', false);
  updateState('isCreatorPageOpen', false);
  updateState('currentDetailAddon', null);
  updateState('currentCreatorPage', null);
  console.log('🏠 Voltando para home');
}

/**
 * Navega para addon detail
 * @param {string} addonId - ID do addon
 */
export function navigateToAddon(addonId) {
  window.location.hash = `#/addon/${addonId}`;
}

/**
 * Navega para página de criador
 * @param {string} slug - Slug do criador
 */
export function navigateToCreator(slug) {
  window.location.hash = `#/criador/${slug}`;
}

/**
 * Volta para home
 */
export function goHome() {
  window.location.hash = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Obtém rota atual
 * @returns {Object} Objeto com tipo e parâmetros da rota
 */
export function getCurrentRoute() {
  const hash = window.location.hash;
  
  if (hash.startsWith('#/addon/')) {
    return {
      type: 'addon',
      id: hash.replace('#/addon/', '')
    };
  } else if (hash.startsWith('#/criador/')) {
    return {
      type: 'creator',
      slug: hash.replace('#/criador/', '')
    };
  } else {
    return {
      type: 'home'
    };
  }
}
