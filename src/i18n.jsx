import { createContext, useContext } from 'react'
import { CONTENT } from './content.js'

export const LANGS = ['fr', 'en']
const KEY = 'mxv-lang'

// Stockage local protégé : navigation privée ou stockage bloqué ne doivent rien casser
export const store = {
  get: k => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignoré */ } },
  del: k => { try { localStorage.removeItem(k) } catch { /* ignoré */ } },
}

export function detectLang() {
  const q = new URLSearchParams(window.location.search).get('lang')
  if (LANGS.includes(q)) return q
  const saved = store.get(KEY)
  if (LANGS.includes(saved)) return saved
  return (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function saveLang(lang) {
  store.set(KEY, lang)
}

export const LangContext = createContext(CONTENT.fr)
export const useT = () => useContext(LangContext)
