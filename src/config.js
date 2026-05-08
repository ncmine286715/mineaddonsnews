/**
 * CONFIGURAÇÃO DO SITE
 * =====================
 * Centraliza todas as constantes, configurações e variáveis de ambiente
 * Nunca coloque chaves de API aqui em produção!
 */

// FIREBASE - USAR VARIÁVEIS DE AMBIENTE EM PRODUÇÃO
// Em desenvolvimento, essas chaves devem estar em um arquivo .env
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || "USE_ENV_VARIABLE",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "mineaddonsnews-web.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DB_URL || "https://mineaddonsnews-web-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "mineaddonsnews-web",
  storageBucket: process.env.FIREBASE_STORAGE || "mineaddonsnews-web.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_SENDER_ID || "877653857210",
  appId: process.env.FIREBASE_APP_ID || "1:877653857210:web:13cbd8a9d58d611600c383",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-YG2BXTLYJJ"
};

// CONSTANTES DE UI
const UI_CONFIG = {
  CARD_TILT_MAX_ROTATION_X: 10,
  CARD_TILT_MAX_ROTATION_Y: 12,
  CARD_TILT_SCALE: 1.03,
  CARD_TILT_TRANSLATE_Y: -12,
  CARD_TILT_THROTTLE_MS: 16, // ~60fps
  SEARCH_DEBOUNCE_MS: 200,
  TOAST_DURATION_MS: 3000,
  LOADING_SCREEN_TIMEOUT_MS: 3000,
  PARTICLES_COUNT: 60,
  PARTICLES_CONNECTION_DISTANCE: 120,
  BLOCK_RAIN_COUNT_MOBILE: 8,
  BLOCK_RAIN_COUNT_DESKTOP: 14,
};

// CACHE KEYS
const CACHE_KEYS = {
  ADDONS: 'mineaddons_addons',
  CREATORS: 'mineaddons_creators',
  FAVORITES: 'mineaddons_favs',
  CACHED_DATA: 'mineaddons_cached_data',
};

// CATEGORIAS COM ÍCONES
const CATEGORIES_ICONS = {
  'Mobs': '🐉',
  'Skin': '👤',
  'Armas': '⚔️',
  'Mapa': '🗺️',
  'Decoração': '🏠',
  'Veículos': '🚗',
  'Tecnologia': '⚙️',
  'Biomas': '🌲',
  'RPG': '🎮',
  'Comida': '🍖',
  'Blocos': '🧱',
  'Ferramentas': '🔧',
  'Magia': '✨',
  'Addons do NCMine': '👑',
};

// MINECRAFT BLOCKS PARA ANIMAÇÃO
const MINECRAFT_BLOCKS = [
  'https://minecraft.wiki/images/thumb/Grass_Block_%28item%29_BE3.png/150px-Grass_Block_%28item%29_BE3.png?ade3d',
  'https://minecraft.wiki/images/thumb/Stone_JE5_BE3.png/150px-Stone_JE5_BE3.png?5780c',
  'https://minecraft.wiki/images/thumb/Dirt_JE2_BE2.png/150px-Dirt_JE2_BE2.png?438ac',
  'https://minecraft.wiki/images/thumb/Block_of_Diamond_JE5_BE3.png/150px-Block_of_Diamond_JE5_BE3.png?542ee'
];

// CRIADOR NCMINE HARDCODED
const NCMINE_CREATOR = {
  slug: 'ncmine',
  nome: 'NCMine',
  verificado: true,
  foto: 'https://yt3.googleusercontent.com/ytc/APkrFKZWeMCsx4Q9e_Hm6nhOOUQ3fv96QGUXiMr1-pRRNA=s176-c-k-c0x00ffffff-no-rj',
  descricao: 'Criador oficial de addons para Minecraft. Os melhores addons do Minecraft Bedrock estão aqui!',
  links: {
    youtube: 'https://www.youtube.com/@NCMine',
  },
  addons: []
};

export {
  FIREBASE_CONFIG,
  UI_CONFIG,
  CACHE_KEYS,
  CATEGORIES_ICONS,
  MINECRAFT_BLOCKS,
  NCMINE_CREATOR,
};
