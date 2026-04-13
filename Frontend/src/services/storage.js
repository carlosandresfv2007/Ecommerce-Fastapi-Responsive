// src/services/storage.js

const KEYS = {
  ACCESS_TOKEN:  'access_token',
  REFRESH_TOKEN: 'refresh_token',
}

export const storage = {

  // guarda ambos tokens después del login
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken)
    } else {
      localStorage.removeItem(KEYS.ACCESS_TOKEN)
    }

    if (refreshToken) {
      localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken)
    } else {
      localStorage.removeItem(KEYS.REFRESH_TOKEN)
    }
  },

  getAccessToken() {
    return localStorage.getItem(KEYS.ACCESS_TOKEN)
  },

  getRefreshToken() {
    const token = localStorage.getItem(KEYS.REFRESH_TOKEN)
    return token && token !== 'null' ? token : null
  },

  // borra todo — se llama al hacer logout
  clear() {
    localStorage.removeItem(KEYS.ACCESS_TOKEN)
    localStorage.removeItem(KEYS.REFRESH_TOKEN)
  },

  // el router usa esto para saber si hay sesión activa
  isAuthenticated() {
    return localStorage.getItem(KEYS.ACCESS_TOKEN) !== null
  },

}