/**
 * STORAGE UTILITIES
 * =====================
 * Funções para trabalhar com localStorage de forma segura
 */

/**
 * Salva dados no localStorage
 * @param {string} key - Chave
 * @param {*} value - Valor (será convertido para JSON)
 * @returns {boolean} Sucesso da operação
 */
export function saveToCache(key, value) {
  try {
    // Validar versão do cache para evitar incompatibilidades futuras
    const cacheEntry = {
      version: 1,
      timestamp: Date.now(),
      data: value
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar no cache (${key}):`, error);
    // Se localStorage estiver cheio, limpar dados antigos
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
    }
    return false;
  }
}

/**
 * Obtém dados do localStorage
 * @param {string} key - Chave
 * @returns {*} Valor ou null se não existir
 */
export function getFromCache(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const cacheEntry = JSON.parse(item);
    
    // Validar versão do cache
    if (cacheEntry.version !== 1) {
      console.warn(`⚠️ Versão de cache desconhecida para ${key}, limpando...`);
      removeFromCache(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.error(`❌ Erro ao ler do cache (${key}):`, error);
    // Se houver erro ao parsear, remover entrada corrompida
    removeFromCache(key);
    return null;
  }
}

/**
 * Remove dados do localStorage
 * @param {string} key - Chave
 * @returns {boolean} Sucesso da operação
 */
export function removeFromCache(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao remover do cache (${key}):`, error);
    return false;
  }
}

/**
 * Limpa cache antigo quando localStorage está cheio
 */
export function clearOldCache() {
  try {
    // Encontrar entrada com timestamp mais antigo
    let oldestKey = null;
    let oldestTime = Infinity;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mineaddons_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item.timestamp < oldestTime) {
            oldestTime = item.timestamp;
            oldestKey = key;
          }
        } catch (e) {
          // Ignorar entradas corrompidas
        }
      }
    }

    if (oldestKey) {
      removeFromCache(oldestKey);
      console.log(`🗑️ Cache antigo removido: ${oldestKey}`);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache antigo:', error);
  }
}

/**
 * Limpa todo o cache da aplicação
 */
export function clearAllCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mineaddons_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => removeFromCache(key));
    console.log(`🗑️ Cache completo limpo (${keys.length} entradas)`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
}

/**
 * Obtém informações sobre o cache
 * @returns {Object} Informações do cache
 */
export function getCacheInfo() {
  try {
    const info = {
      totalEntries: 0,
      totalSize: 0,
      entries: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mineaddons_')) {
        const item = localStorage.getItem(key);
        const size = new Blob([item]).size;
        info.totalEntries++;
        info.totalSize += size;
        info.entries[key] = {
          size: size,
          timestamp: JSON.parse(item)?.timestamp || null
        };
      }
    }

    return info;
  } catch (error) {
    console.error('❌ Erro ao obter informações do cache:', error);
    return { totalEntries: 0, totalSize: 0, entries: {} };
  }
}
