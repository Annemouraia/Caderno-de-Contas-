const PREFIXO = "caderno-de-contas";

function chaveCompleta(key, shared) {
  return `${PREFIXO}:${shared ? "compartilhado" : "local"}:${key}`;
}

export const storage = {
  async get(key, shared = false) {
    const raw = window.localStorage.getItem(chaveCompleta(key, shared));
    if (raw === null) {
      throw new Error(`Chave não encontrada: ${key}`);
    }
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    try {
      window.localStorage.setItem(chaveCompleta(key, shared), value);
      return { key, value, shared };
    } catch (e) {
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      window.localStorage.removeItem(chaveCompleta(key, shared));
      return { key, deleted: true, shared };
    } catch (e) {
      return null;
    }
  },

  async list(prefix = "", shared = false) {
    const base = chaveCompleta(prefix, shared);
    const raizSemPrefixo = chaveCompleta("", shared);
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(base)) keys.push(k.slice(raizSemPrefixo.length));
    }
    return { keys, prefix, shared };
  },
};

export function armazenamentoDisponivel() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch (e) {
    return false;
  }
                                                     }
