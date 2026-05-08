/**
 * FIREBASE ADDONS OPERATIONS
 * =====================
 * Funções para buscar, salvar e atualizar addons
 * Separado do resto do código para melhor manutenção
 */

import { getDatabase } from './firebase-init.js';
import { CACHE_KEYS } from '../config.js';
import { saveToCache, getFromCache } from '../utils/storage.js';

/**
 * Busca todos os addons do Firebase
 * @returns {Promise<Array>} Array de addons
 */
export async function fetchAddonsFromFirebase() {
  try {
    const db = getDatabase();
    if (!db) {
      console.error('❌ Firebase não está inicializado');
      return [];
    }

    return new Promise((resolve) => {
      db.ref('addons').once('value', (snapshot) => {
        if (snapshot.exists()) {
          const addons = snapshot.val() || [];
          resolve(Array.isArray(addons) ? addons : Object.values(addons));
        } else {
          resolve([]);
        }
      }).catch((error) => {
        console.error('❌ Erro ao buscar addons do Firebase:', error);
        resolve([]); // Retorna array vazio em caso de erro
      });
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar addons:', error);
    return [];
  }
}

/**
 * Busca addons com cache local
 * @returns {Promise<Array>} Array de addons
 */
export async function fetchAddons() {
  try {
    // Tentar carregar do cache primeiro
    const cached = getFromCache(CACHE_KEYS.ADDONS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      console.log('📦 Addons carregados do cache');
      
      // Atualizar do Firebase em background
      fetchAddonsFromFirebase().then((fresh) => {
        if (fresh.length > 0) {
          saveToCache(CACHE_KEYS.ADDONS, fresh);
          console.log('✅ Cache de addons atualizado');
          // Disparar evento para re-render
          window.dispatchEvent(new CustomEvent('addonsUpdated', { detail: fresh }));
        }
      });

      return cached;
    }

    // Se não houver cache, buscar do Firebase
    const fresh = await fetchAddonsFromFirebase();
    if (fresh.length > 0) {
      saveToCache(CACHE_KEYS.ADDONS, fresh);
    }
    return fresh;
  } catch (error) {
    console.error('❌ Erro ao buscar addons:', error);
    return [];
  }
}

/**
 * Incrementa contador de downloads de um addon
 * @param {string} addonId - ID do addon
 */
export function incrementDownloadCount(addonId) {
  try {
    const db = getDatabase();
    if (!db) {
      console.error('❌ Firebase não está inicializado');
      return;
    }

    db.ref(`addons/${addonId}/downloads`).transaction((current) => {
      return (current || 0) + 1;
    }).catch((error) => {
      console.error('❌ Erro ao incrementar downloads:', error);
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao incrementar downloads:', error);
  }
}

/**
 * Busca um addon específico
 * @param {string} addonId - ID do addon
 * @returns {Promise<Object|null>} Addon ou null
 */
export async function fetchAddonById(addonId) {
  try {
    const db = getDatabase();
    if (!db) {
      console.error('❌ Firebase não está inicializado');
      return null;
    }

    return new Promise((resolve) => {
      db.ref(`addons/${addonId}`).once('value', (snapshot) => {
        resolve(snapshot.exists() ? snapshot.val() : null);
      }).catch((error) => {
        console.error('❌ Erro ao buscar addon:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar addon:', error);
    return null;
  }
}
