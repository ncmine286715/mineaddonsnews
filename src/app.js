/**
 * MAIN APPLICATION ENTRY POINT
 * =====================
 * Inicializa a aplicação com carregamento instantâneo via cache
 * Sem delays, sem loading screens, sem timeouts artificiais
 */

import { initializeFirebase } from './firebase/firebase-init.js';
import { fetchAddons } from './firebase/addons.js';
import { fetchCreators } from './firebase/creators.js';
import { state, updateState, updateStateMultiple } from './state/store.js';
import { saveToCache, getFromCache } from './utils/storage.js';
import { CACHE_KEYS } from './config.js';
import { spawnBlockRain, initializeParticles } from './ui/effects.js';
import { renderInterface } from './ui/render-interface.js';
import { initializeRouter } from './router/router.js';

/**
 * Boot da aplicação - Carregamento instantâneo
 * 1. Renderiza cache instantaneamente
 * 2. Atualiza dados em background
 * 3. Sem delays, sem loading screens
 */
async function boot() {
  try {
    console.log('🚀 Iniciando aplicação...');

    // 1. Inicializar Firebase (não bloqueia)
    const db = initializeFirebase();

    // 2. Carregar cache instantaneamente (síncrono)
    const cachedAddons = getFromCache(CACHE_KEYS.ADDONS);
    const cachedCreators = getFromCache(CACHE_KEYS.CREATORS);

    if (cachedAddons && cachedAddons.length > 0) {
      console.log('📦 Carregando do cache (instantâneo)');
      updateStateMultiple({
        addons: cachedAddons,
        creators: cachedCreators || [],
        isLoading: false
      });

      // Renderizar IMEDIATAMENTE com dados do cache
      renderInterface();
      initializeParticles();
      spawnBlockRain();
      initializeRouter();
      setupEventListeners();

      console.log(`✅ Interface pronta: ${cachedAddons.length} addons`);
    } else {
      // Se não houver cache, renderizar vazio e aguardar dados
      console.log('⚠️ Sem cache, aguardando dados do Firebase...');
      renderInterface();
      initializeRouter();
      setupEventListeners();
    }

    // 3. Atualizar dados em background (não bloqueia)
    if (db) {
      updateDataInBackground();
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
  }
}

/**
 * Atualiza dados em background sem bloquear a UI
 */
async function updateDataInBackground() {
  try {
    console.log('🔄 Atualizando dados em background...');
    const [freshAddons, freshCreators] = await Promise.all([
      fetchAddons(),
      fetchCreators()
    ]);

    // Só atualiza se houver dados novos
    if (freshAddons && freshAddons.length > 0) {
      updateState('addons', freshAddons);
      console.log('✅ Addons atualizados');
      // Disparar evento para re-render se necessário
      window.dispatchEvent(new CustomEvent('addonsUpdated', { detail: freshAddons }));
    }

    if (freshCreators && freshCreators.length > 0) {
      updateState('creators', freshCreators);
      console.log('✅ Criadores atualizados');
    }
  } catch (error) {
    console.error('⚠️ Erro ao atualizar dados:', error);
    // Não faz nada, cache continua sendo exibido
  }
}

/**
 * Configura listeners de eventos
 */
function setupEventListeners() {
  // Listener para mudanças de estado
  window.addEventListener('stateChanged', (e) => {
    console.log('📡 Estado alterado:', e.detail);
  });

  // Listener para favoritos alterados
  window.addEventListener('favoritesChanged', (e) => {
    saveToCache(CACHE_KEYS.FAVORITES, e.detail);
    console.log('❤️ Favoritos salvos:', e.detail.length);
  });

  // Listener para addons atualizados em background
  window.addEventListener('addonsUpdated', (e) => {
    updateState('addons', e.detail);
    renderInterface(); // Re-render silencioso
    console.log('✅ Addons atualizados');
  });

  // Listener para criadores atualizados em background
  window.addEventListener('creatorsUpdated', (e) => {
    updateState('creators', e.detail);
    console.log('✅ Criadores atualizados');
  });
}

/**
 * Função para buscar site config do Firebase
 */
export async function loadSiteConfig() {
  try {
    const db = initializeFirebase();
    if (!db) return;

    return new Promise((resolve) => {
      db.ref('siteConfig').once('value', (snapshot) => {
        if (snapshot.exists()) {
          const config = snapshot.val();
          updateState('siteConfig', config);
          console.log('⚙️ Site config carregado');
          resolve(config);
        } else {
          resolve(null);
        }
      }).catch((error) => {
        console.error('❌ Erro ao carregar site config:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao carregar site config:', error);
    return null;
  }
}

// =====================
// INICIALIZAÇÃO
// =====================
// Iniciar IMEDIATAMENTE sem delays
boot();

// Exportar para uso global
window.appState = state;
window.updateState = updateState;
