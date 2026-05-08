/**
 * FIREBASE CREATORS OPERATIONS
 * =====================
 * Funções para buscar e gerenciar criadores
 */

import { getDatabase } from './firebase-init.js';
import { CACHE_KEYS, NCMINE_CREATOR } from '../config.js';
import { saveToCache, getFromCache } from '../utils/storage.js';

/**
 * Busca todos os criadores do Firebase
 * @returns {Promise<Array>} Array de criadores
 */
export async function fetchCreatorsFromFirebase() {
  try {
    const db = getDatabase();
    if (!db) {
      console.error('❌ Firebase não está inicializado');
      return [NCMINE_CREATOR];
    }

    return new Promise((resolve) => {
      db.ref('creators').once('value', (snapshot) => {
        if (snapshot.exists()) {
          const creators = snapshot.val() || [];
          const creatorsArray = Array.isArray(creators) ? creators : Object.values(creators);
          
          // Filtrar NCMine duplicado e adicionar no início
          const filtered = creatorsArray.filter(c => c.slug !== 'ncmine');
          resolve([NCMINE_CREATOR, ...filtered]);
        } else {
          resolve([NCMINE_CREATOR]);
        }
      }).catch((error) => {
        console.error('❌ Erro ao buscar criadores do Firebase:', error);
        resolve([NCMINE_CREATOR]); // Retorna apenas NCMine em caso de erro
      });
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar criadores:', error);
    return [NCMINE_CREATOR];
  }
}

/**
 * Busca criadores com cache local
 * @returns {Promise<Array>} Array de criadores
 */
export async function fetchCreators() {
  try {
    // Tentar carregar do cache primeiro
    const cached = getFromCache(CACHE_KEYS.CREATORS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      console.log('👥 Criadores carregados do cache');
      
      // Atualizar do Firebase em background
      fetchCreatorsFromFirebase().then((fresh) => {
        if (fresh.length > 0) {
          saveToCache(CACHE_KEYS.CREATORS, fresh);
          console.log('✅ Cache de criadores atualizado');
          // Disparar evento para re-render
          window.dispatchEvent(new CustomEvent('creatorsUpdated', { detail: fresh }));
        }
      });

      return cached;
    }

    // Se não houver cache, buscar do Firebase
    const fresh = await fetchCreatorsFromFirebase();
    if (fresh.length > 0) {
      saveToCache(CACHE_KEYS.CREATORS, fresh);
    }
    return fresh;
  } catch (error) {
    console.error('❌ Erro ao buscar criadores:', error);
    return [NCMINE_CREATOR];
  }
}

/**
 * Busca um criador específico
 * @param {string} slug - Slug do criador
 * @returns {Promise<Object|null>} Criador ou null
 */
export async function fetchCreatorBySlug(slug) {
  try {
    if (slug === 'ncmine') {
      return NCMINE_CREATOR;
    }

    const db = getDatabase();
    if (!db) {
      console.error('❌ Firebase não está inicializado');
      return null;
    }

    return new Promise((resolve) => {
      db.ref('creators').orderByChild('slug').equalTo(slug).once('value', (snapshot) => {
        if (snapshot.exists()) {
          const creators = snapshot.val();
          const creator = Object.values(creators)[0];
          resolve(creator || null);
        } else {
          resolve(null);
        }
      }).catch((error) => {
        console.error('❌ Erro ao buscar criador:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar criador:', error);
    return null;
  }
}
