/**
 * FORMAT UTILITIES
 * =====================
 * Funções para formatação de dados
 */

/**
 * Normaliza texto para busca (remove acentos, espaços, caracteres especiais)
 * @param {string} str - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export function normalize(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais
    .trim();
}

/**
 * Formata número para formato legível (K, M, etc)
 * @param {number} n - Número a formatar
 * @returns {string} Número formatado
 */
export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

/**
 * Formata número com separador de milhares
 * @param {number} n - Número a formatar
 * @returns {string} Número formatado
 */
export function formatNumberWithSeparator(n) {
  return n.toLocaleString('pt-BR');
}

/**
 * Formata data para formato legível
 * @param {number} timestamp - Timestamp em milissegundos
 * @returns {string} Data formatada
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora
 * @param {number} timestamp - Timestamp em milissegundos
 * @returns {string} Data e hora formatadas
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR');
}

/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} str - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Sanitiza HTML removendo scripts e tags perigosas
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  
  // Criar elemento temporário
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remover scripts
  const scripts = temp.querySelectorAll('script, iframe, object, embed');
  scripts.forEach(script => script.remove());
  
  // Remover atributos perigosos
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remover atributos que podem conter JavaScript
    const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout'];
    dangerousAttrs.forEach(attr => el.removeAttribute(attr));
  });
  
  return temp.innerHTML;
}

/**
 * Trunca texto com ellipsis
 * @param {string} str - Texto a truncar
 * @param {number} length - Comprimento máximo
 * @returns {string} Texto truncado
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * Converte rating numérico em estrelas
 * @param {number} rating - Rating (0-5)
 * @returns {string} HTML com estrelas
 */
export function renderStars(rating) {
  const rounded = Math.round(rating || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rounded ? 'filled' : 'empty'}">★</span>`;
  }
  return html;
}

/**
 * Calcula tempo decorrido desde um timestamp
 * @param {number} timestamp - Timestamp em milissegundos
 * @returns {string} Tempo decorrido (ex: "2 horas atrás")
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'agora mesmo';
  if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  if (days < 30) return `${days} dia${days > 1 ? 's' : ''} atrás`;
  
  return formatDate(timestamp);
}
