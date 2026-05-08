/**
 * FIREBASE INITIALIZATION
 * =====================
 * Inicializa o Firebase com tratamento de erros adequado
 * Nunca exponha chaves de API no código-fonte!
 */

import { FIREBASE_CONFIG } from '../config.js';

let db = null;
let isInitialized = false;

/**
 * Inicializa o Firebase
 * @returns {Object} Referência do banco de dados
 */
export function initializeFirebase() {
  if (isInitialized) {
    return db;
  }

  try {
    // Verificar se Firebase está disponível globalmente
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK não foi carregado. Verifique se está incluído no HTML.');
      return null;
    }

    // Validar configuração
    if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.apiKey === 'USE_ENV_VARIABLE') {
      console.warn('⚠️ Firebase config incompleta. Use variáveis de ambiente em produção.');
    }

    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    isInitialized = true;

    console.log('✅ Firebase inicializado com sucesso');
    return db;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    return null;
  }
}

/**
 * Obtém referência do banco de dados
 * @returns {Object} Referência do banco de dados
 */
export function getDatabase() {
  if (!isInitialized) {
    return initializeFirebase();
  }
  return db;
}

/**
 * Verifica se Firebase está inicializado
 * @returns {boolean}
 */
export function isFirebaseReady() {
  return isInitialized && db !== null;
}
