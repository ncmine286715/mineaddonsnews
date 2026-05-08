// =========================================================
// Config global do site — Mine Addons News
// Trocar valores aqui ao plugar Firebase / GitHub no futuro.
// =========================================================

export const SITE = {
  name: "Mine Addons News",
  tagline: "Addons premium para Minecraft Bedrock",
  description:
    "Hospedagem premium e divulgação de Addons para Minecraft Bedrock. Cards visuais, downloads seguros e tutoriais oficiais.",
  url: "https://mineaddonsnews.com",
  twitter: "@MineAddonsNews",
  defaultTheme: "dark",
}

export const SOCIALS = {
  youtube: "https://youtube.com/@mineaddonsnews",
  discord: "https://discord.gg/mineaddonsnews",
  tiktok: "https://tiktok.com/@mineaddonsnews",
  instagram: "https://instagram.com/mineaddonsnews",
  twitter: "https://twitter.com/mineaddonsnews",
}

export const CREATOR = {
  // Nome usado na seção "Meus Addons" (Linktree premium)
  displayName: "Mine Addons News",
  bio: "Os melhores addons criados pelo canal — direto da bio.",
  avatarInitials: "MN",
}

// =========================================================
// Backend toggle — quando você plugar Firebase/GitHub:
//   1. Mudar BACKEND_MODE para "firebase"
//   2. Preencher FIREBASE_CONFIG e GITHUB_DB
//   3. Os módulos storage.js / db.js / auth.js já fazem o switch.
// =========================================================
export const BACKEND_MODE = "local" // "local" | "firebase"

export const FIREBASE_CONFIG = {
  // TODO: cole aqui as chaves do Firebase quando configurar
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
}

export const GITHUB_DB = {
  // Repositório público que hospeda o JSON dos addons
  // Ex.: https://raw.githubusercontent.com/usuario/repo/main/addons.json
  // TODO: trocar quando conectar o database no GitHub
  rawUrl: "",
  apiUrl: "", // Ex.: https://api.github.com/repos/usuario/repo/contents/addons.json
  branch: "main",
  // Token NUNCA deve ficar exposto em produção; aqui é só placeholder pro admin local.
  token: "",
}

// =========================================================
// Admin local (apenas modo "local"). Em prod, use Firebase Auth.
// =========================================================
export const LOCAL_ADMIN = {
  // Senha demo apenas para modo local. Trocar por Firebase Auth em produção.
  username: "admin",
  password: "minecraft",
}

// =========================================================
// Categorias do site
// =========================================================
export const CATEGORIES = [
  { id: "magic",       name: "Magia",         icon: "sparkles" },
  { id: "tech",        name: "Tecnologia",    icon: "cpu" },
  { id: "weapons",     name: "Armas",         icon: "sword" },
  { id: "mobs",        name: "Mobs",          icon: "ghost" },
  { id: "structures",  name: "Estruturas",    icon: "castle" },
  { id: "utility",     name: "Utilidades",    icon: "wrench" },
  { id: "shaders",     name: "Shaders",       icon: "image" },
  { id: "textures",    name: "Texturas",      icon: "palette" },
]
