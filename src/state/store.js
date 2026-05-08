/**
 * CENTRALIZED STATE STORE
 * =====================
 * Todas as variáveis globais em um único lugar
 * Facilita rastreamento e debug
 */

import { CACHE_KEYS } from '../config.js';
import { getFromCache } from '../utils/storage.js';

// Estado central da aplicação
export const state = {
  // Dados
  addons: [],
  creators: [],
  siteConfig: {},
  
  // Filtros e ordenação
  currentCategory: 'all',
  currentSort: 'newest',
  searchQuery: '',
  
  // Favoritos
  favorites: getFromCache(CACHE_KEYS.FAVORITES) || [],
  showFavoritesOnly: false,
  
  // UI
  isLoading: true,
  isDetailOpen: false,
  isCreatorPageOpen: false,
  currentDetailAddon: null,
  currentCreatorPage: null,
};

/**
 * Atualiza o estado
 * @param {string} key - Chave do estado
 * @param {*} value - Novo valor
 */
export function updateState(key, value) {
  if (key in state) {
    state[key] = value;
    // Disparar evento para componentes que escutam
    window.dispatchEvent(new CustomEvent('stateChanged', { detail: { key, value } }));
  } else {
    console.warn(`⚠️ Chave de estado desconhecida: ${key}`);
  }
}

/**
 * Atualiza múltiplos valores de estado
 * @param {Object} updates - Objeto com atualizações
 */
export function updateStateMultiple(updates) {
  Object.entries(updates).forEach(([key, value]) => {
    updateState(key, value);
  });
}

/**
 * Obtém valor do estado
 * @param {string} key - Chave do estado
 * @returns {*} Valor do estado
 */
export function getStateValue(key) {
  return state[key];
}

/**
 * Reset do estado para valores padrão
 */
export function resetState() {
  updateStateMultiple({
    currentCategory: 'all',
    currentSort: 'newest',
    searchQuery: '',
    showFavoritesOnly: false,
    isDetailOpen: false,
    isCreatorPageOpen: false,
    currentDetailAddon: null,
    currentCreatorPage: null,
  });
}

/**
 * Adiciona addon aos favoritos
 * @param {string} addonId - ID do addon
 */
export function addFavorite(addonId) {
  if (!state.favorites.includes(addonId)) {
    state.favorites.push(addonId);
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: state.favorites }));
  }
}

/**
 * Remove addon dos favoritos
 * @param {string} addonId - ID do addon
 */
export function removeFavorite(addonId) {
  state.favorites = state.favorites.filter(id => id !== addonId);
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: state.favorites }));
}

/**
 * Verifica se addon é favorito
 * @param {string} addonId - ID do addon
 * @returns {boolean}
 */
export function isFavorite(addonId) {
  return state.favorites.includes(addonId);
}

/**
 * Limpa todos os favoritos
 */
export function clearFavorites() {
  state.favorites = [];
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: state.favorites }));
}
