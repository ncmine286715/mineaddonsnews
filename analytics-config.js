/**
 * Analytics & Monetization Configuration
 * Mineaddonsnews v2
 * 
 * Este arquivo centraliza toda a configuração de analytics, eventos e monetização
 */

// =====================
// GOOGLE ANALYTICS 4
// =====================
// Adicionar ao <head> do index-v2.html:
// <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Substituir GA_MEASUREMENT_ID pela sua ID real
// Encontrar em: Google Analytics → Admin → Property → Data Streams

// =====================
// EVENTOS CUSTOMIZADOS
// =====================

class AnalyticsTracker {
  constructor() {
    this.sessionStart = new Date();
    this.sessionAddonsViewed = [];
    this.sessionDownloads = [];
  }

  /**
   * Rastrear visualização de addon
   */
  trackAddonView(addonId, addonName, category) {
    this.sessionAddonsViewed.push(addonId);
    
    gtag('event', 'view_addon', {
      'addon_id': addonId,
      'addon_name': addonName,
      'addon_category': category,
      'session_addons_viewed': this.sessionAddonsViewed.length
    });

    // Firebase Analytics (se implementado)
    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('view_addon', {
        addon_id: addonId,
        addon_name: addonName,
        addon_category: category
      });
    }
  }

  /**
   * Rastrear download de addon
   */
  trackDownload(addonId, addonName, category) {
    this.sessionDownloads.push(addonId);
    
    gtag('event', 'download', {
      'addon_id': addonId,
      'addon_name': addonName,
      'addon_category': category,
      'session_downloads': this.sessionDownloads.length,
      'session_view_to_download_time': new Date() - this.sessionStart
    });

    // Firebase Analytics
    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('download', {
        addon_id: addonId,
        addon_name: addonName,
        addon_category: category
      });
    }

    // Rastrear conversão
    this.trackConversion('download', addonId);
  }

  /**
   * Rastrear busca
   */
  trackSearch(query, resultsCount) {
    gtag('event', 'search', {
      'search_term': query,
      'results_count': resultsCount
    });

    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('search', {
        search_term: query,
        results_count: resultsCount
      });
    }
  }

  /**
   * Rastrear filtro por categoria
   */
  trackCategoryFilter(category, addonsCount) {
    gtag('event', 'view_category', {
      'category': category,
      'addons_count': addonsCount
    });

    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('view_category', {
        category: category,
        addons_count: addonsCount
      });
    }
  }

  /**
   * Rastrear favorito
   */
  trackFavorite(addonId, addonName, action) {
    gtag('event', action === 'add' ? 'add_to_favorites' : 'remove_from_favorites', {
      'addon_id': addonId,
      'addon_name': addonName
    });

    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('favorite', {
        addon_id: addonId,
        addon_name: addonName,
        action: action
      });
    }
  }

  /**
   * Rastrear compartilhamento
   */
  trackShare(addonId, addonName, method) {
    gtag('event', 'share', {
      'addon_id': addonId,
      'addon_name': addonName,
      'method': method
    });

    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('share', {
        addon_id: addonId,
        addon_name: addonName,
        method: method
      });
    }
  }

  /**
   * Rastrear visualização de tutorial
   */
  trackTutorialView() {
    gtag('event', 'view_tutorial', {
      'timestamp': new Date().toISOString()
    });

    if (typeof firebase !== 'undefined') {
      firebase.analytics().logEvent('view_tutorial');
    }
  }

  /**
   * Rastrear conversão (download, etc)
   */
  trackConversion(type, addonId) {
    gtag('event', 'conversion', {
      'conversion_type': type,
      'addon_id': addonId,
      'conversion_value': 1
    });

    // Enviar para Firebase para análise
    if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
      db.ref('analytics/conversions').push({
        type: type,
        addon_id: addonId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Rastrear tempo de sessão
   */
  trackSessionEnd() {
    const sessionDuration = (new Date() - this.sessionStart) / 1000; // em segundos

    gtag('event', 'session_end', {
      'session_duration': sessionDuration,
      'addons_viewed': this.sessionAddonsViewed.length,
      'downloads': this.sessionDownloads.length,
      'conversion_rate': this.sessionDownloads.length / Math.max(this.sessionAddonsViewed.length, 1)
    });

    if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
      db.ref('analytics/sessions').push({
        duration: sessionDuration,
        addons_viewed: this.sessionAddonsViewed.length,
        downloads: this.sessionDownloads.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Rastrear erro
   */
  trackError(errorMessage, errorCode) {
    gtag('event', 'exception', {
      'description': errorMessage,
      'error_code': errorCode
    });

    console.error(`[Analytics] Error: ${errorCode} - ${errorMessage}`);
  }
}

// Instância global
const analytics = new AnalyticsTracker();

// Rastrear quando usuário sai da página
window.addEventListener('beforeunload', () => {
  analytics.trackSessionEnd();
});

// =====================
// MONETIZAÇÃO
// =====================

class MonetizationManager {
  constructor() {
    this.adSlotsConfig = {
      'hero-banner': {
        type: 'banner',
        size: '970x90',
        position: 'top',
        enabled: true
      },
      'sidebar-skyscraper': {
        type: 'skyscraper',
        size: '300x600',
        position: 'right',
        enabled: true,
        desktop_only: true
      },
      'native-ads': {
        type: 'native',
        position: 'between-cards',
        frequency: 6, // a cada 6 cards
        enabled: true
      },
      'modal-footer': {
        type: 'banner',
        size: '300x250',
        position: 'modal-footer',
        enabled: true
      }
    };

    this.affiliateLinks = {
      // Exemplo: plataformas de download com programa de afiliados
      'mediafire': {
        base_url: 'https://www.mediafire.com/download/',
        affiliate_code: 'YOUR_AFFILIATE_CODE'
      }
    };

    this.adProviders = {
      'google-adsense': {
        enabled: false,
        client_id: 'ca-pub-xxxxxxxxxxxxxxxx',
        slots: {}
      },
      'programmatic': {
        enabled: false,
        network_id: 'YOUR_NETWORK_ID'
      }
    };
  }

  /**
   * Inicializar Google AdSense
   */
  initGoogleAdsense() {
    if (!this.adProviders['google-adsense'].enabled) return;

    // Adicionar script do Google AdSense
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + 
                 this.adProviders['google-adsense'].client_id;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Reinicializar ads após carregar conteúdo dinâmico
    window.adsbygoogle = window.adsbygoogle || [];
  }

  /**
   * Renderizar ad slot
   */
  renderAdSlot(slotId) {
    const config = this.adSlotsConfig[slotId];
    if (!config || !config.enabled) return;

    // Criar container
    const container = document.createElement('div');
    container.id = `ad-${slotId}`;
    container.className = 'ad-slot';
    container.dataset.slot = slotId;

    // Adicionar atributos específicos do provider
    if (this.adProviders['google-adsense'].enabled) {
      container.className += ' adsbygoogle';
      container.setAttribute('data-ad-client', this.adProviders['google-adsense'].client_id);
      container.setAttribute('data-ad-slot', this.adProviders['google-adsense'].slots[slotId] || '');
      container.setAttribute('data-ad-format', 'auto');
      container.setAttribute('data-full-width-responsive', 'true');
    }

    return container;
  }

  /**
   * Processar link de download com monetização
   */
  processDownloadLink(originalLink, addonId, addonName) {
    // Opção 1: Redirect através de link encurtado com ads
    // Exemplo: bit.ly, short.io com monetização

    // Opção 2: Affiliate link (se aplicável)
    // Exemplo: MediaFire com código de afiliado

    // Opção 3: Landing page com ads antes do download
    const landingPage = `/download-redirect.html?addon=${addonId}&url=${encodeURIComponent(originalLink)}`;

    // Por enquanto, retornar link original
    // Implementar monetização conforme necessário
    return originalLink;
  }

  /**
   * Rastrear impressão de ad
   */
  trackAdImpression(slotId) {
    gtag('event', 'ad_impression', {
      'ad_slot': slotId
    });
  }

  /**
   * Rastrear clique em ad
   */
  trackAdClick(slotId) {
    gtag('event', 'ad_click', {
      'ad_slot': slotId
    });
  }

  /**
   * Calcular receita estimada
   */
  calculateEstimatedRevenue(impressions, cpm = 5) {
    // CPM = Cost Per Mille (por 1000 impressões)
    return (impressions / 1000) * cpm;
  }

  /**
   * Dashboard de monetização (para admin)
   */
  getMonetizationStats() {
    return {
      total_impressions: 0,
      total_clicks: 0,
      ctr: 0, // Click-through rate
      estimated_revenue: 0,
      revenue_per_download: 0
    };
  }
}

// Instância global
const monetization = new MonetizationManager();

// =====================
// DASHBOARD ANALYTICS (Para Admin)
// =====================

class AnalyticsDashboard {
  constructor(db) {
    this.db = db;
    this.stats = {
      total_downloads: 0,
      total_views: 0,
      conversion_rate: 0,
      avg_session_duration: 0,
      top_addons: [],
      top_categories: [],
      traffic_by_source: {}
    };
  }

  /**
   * Carregar stats do Firebase
   */
  async loadStats() {
    try {
      // Total de downloads
      const downloadsSnapshot = await this.db.ref('addons').once('value');
      let totalDownloads = 0;
      let totalViews = 0;
      const topAddons = [];

      downloadsSnapshot.forEach(child => {
        const addon = child.val();
        totalDownloads += addon.downloads || 0;
        totalViews += addon.views || 0;
        topAddons.push({
          name: addon.nome,
          downloads: addon.downloads || 0,
          views: addon.views || 0,
          conversion: ((addon.downloads || 0) / Math.max(addon.views || 1, 1) * 100).toFixed(2) + '%'
        });
      });

      topAddons.sort((a, b) => b.downloads - a.downloads);

      this.stats.total_downloads = totalDownloads;
      this.stats.total_views = totalViews;
      this.stats.conversion_rate = ((totalDownloads / Math.max(totalViews, 1)) * 100).toFixed(2) + '%';
      this.stats.top_addons = topAddons.slice(0, 10);

      return this.stats;
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      return null;
    }
  }

  /**
   * Renderizar dashboard
   */
  renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="analytics-dashboard">
        <div class="stat-card">
          <h3>Total de Downloads</h3>
          <p class="stat-value">${this.stats.total_downloads}</p>
        </div>
        <div class="stat-card">
          <h3>Total de Visualizações</h3>
          <p class="stat-value">${this.stats.total_views}</p>
        </div>
        <div class="stat-card">
          <h3>Taxa de Conversão</h3>
          <p class="stat-value">${this.stats.conversion_rate}</p>
        </div>
        <div class="stat-card">
          <h3>Top Addons</h3>
          <ul>
            ${this.stats.top_addons.map(addon => `
              <li>
                <strong>${addon.name}</strong>
                <span>${addon.downloads} downloads (${addon.conversion})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// =====================
// EXPORTAR PARA USO GLOBAL
// =====================

// Usar em index-v2.html:
// <script src="analytics-config.js"></script>
// 
// Exemplos de uso:
// analytics.trackAddonView('addon-id', 'Dragon Mod', 'mobs');
// analytics.trackDownload('addon-id', 'Dragon Mod', 'mobs');
// analytics.trackSearch('dragon', 5);
// monetization.initGoogleAdsense();
// monetization.renderAdSlot('hero-banner');

console.log('✅ Analytics & Monetization Config Loaded');
console.log('📊 Analytics Tracker:', analytics);
console.log('💰 Monetization Manager:', monetization);
