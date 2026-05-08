/**
 * ANALYTICS UTILITIES
 * =====================
 * Funções para rastreamento de downloads e eventos
 */

import { incrementDownloadCount } from '../firebase/addons.js';

/**
 * Rastreia download de um addon
 * @param {string} addonId - ID do addon
 * @param {HTMLElement} buttonElement - Elemento do botão (opcional)
 */
export function trackDownload(addonId, buttonElement = null) {
  try {
    // Incrementar contador no Firebase
    incrementDownloadCount(addonId);

    // Efeito visual no botão
    if (buttonElement) {
      buttonElement.classList.add('dl-burst');
      setTimeout(() => {
        buttonElement.classList.remove('dl-burst');
      }, 600);
    }

    // Log para analytics
    console.log(`📊 Download rastreado: ${addonId}`);

    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('downloadTracked', {
      detail: {
        addonId,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear download:', error);
  }
}

/**
 * Rastreia visualização de addon
 * @param {string} addonId - ID do addon
 */
export function trackAddonView(addonId) {
  try {
    console.log(`👁️ Visualização rastreada: ${addonId}`);

    window.dispatchEvent(new CustomEvent('addonViewed', {
      detail: {
        addonId,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear visualização:', error);
  }
}

/**
 * Rastreia busca
 * @param {string} query - Termo de busca
 * @param {number} resultCount - Quantidade de resultados
 */
export function trackSearch(query, resultCount) {
  try {
    console.log(`🔍 Busca rastreada: "${query}" (${resultCount} resultados)`);

    window.dispatchEvent(new CustomEvent('searchPerformed', {
      detail: {
        query,
        resultCount,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear busca:', error);
  }
}

/**
 * Rastreia filtro aplicado
 * @param {string} filterType - Tipo de filtro (category, sort)
 * @param {string} filterValue - Valor do filtro
 */
export function trackFilter(filterType, filterValue) {
  try {
    console.log(`🔽 Filtro rastreado: ${filterType} = ${filterValue}`);

    window.dispatchEvent(new CustomEvent('filterApplied', {
      detail: {
        filterType,
        filterValue,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear filtro:', error);
  }
}

/**
 * Rastreia favorito adicionado/removido
 * @param {string} addonId - ID do addon
 * @param {boolean} isFavorited - Se foi adicionado aos favoritos
 */
export function trackFavorite(addonId, isFavorited) {
  try {
    const action = isFavorited ? 'adicionado' : 'removido';
    console.log(`❤️ Favorito ${action}: ${addonId}`);

    window.dispatchEvent(new CustomEvent('favoriteToggled', {
      detail: {
        addonId,
        isFavorited,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear favorito:', error);
  }
}

/**
 * Rastreia compartilhamento
 * @param {string} addonId - ID do addon
 * @param {string} method - Método de compartilhamento (share-api, copy-link)
 */
export function trackShare(addonId, method) {
  try {
    console.log(`📤 Compartilhamento rastreado: ${addonId} via ${method}`);

    window.dispatchEvent(new CustomEvent('addonShared', {
      detail: {
        addonId,
        method,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear compartilhamento:', error);
  }
}

/**
 * Rastreia erro
 * @param {string} errorType - Tipo de erro
 * @param {string} errorMessage - Mensagem de erro
 * @param {Object} context - Contexto adicional
 */
export function trackError(errorType, errorMessage, context = {}) {
  try {
    console.error(`⚠️ Erro rastreado: ${errorType} - ${errorMessage}`);

    window.dispatchEvent(new CustomEvent('errorOccurred', {
      detail: {
        errorType,
        errorMessage,
        context,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear erro:', error);
  }
}

/**
 * Rastreia performance
 * @param {string} metricName - Nome da métrica
 * @param {number} value - Valor da métrica
 * @param {string} unit - Unidade (ms, bytes, etc)
 */
export function trackPerformance(metricName, value, unit = 'ms') {
  try {
    console.log(`⚡ Performance: ${metricName} = ${value}${unit}`);

    window.dispatchEvent(new CustomEvent('performanceMetric', {
      detail: {
        metricName,
        value,
        unit,
        timestamp: Date.now()
      }
    }));
  } catch (error) {
    console.error('❌ Erro ao rastrear performance:', error);
  }
}

/**
 * Inicializa listeners para rastreamento automático
 */
export function initializeAnalytics() {
  // Rastrear Web Vitals se disponível
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackPerformance('LCP', lastEntry.renderTime || lastEntry.loadTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          trackPerformance('FID', entry.processingDuration, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      console.log('✅ Analytics inicializado');
    } catch (error) {
      console.warn('⚠️ Não foi possível inicializar Web Vitals:', error);
    }
  }
}
