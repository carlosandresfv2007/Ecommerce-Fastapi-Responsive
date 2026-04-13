// src/services/api.js

import { storage } from './storage.js'

const BASE_URL = 'http://127.0.0.1:8000'
const AUTH_CHANGED_EVENT = 'auth-changed'

function emitAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, {
    detail: { authenticated: storage.isAuthenticated() },
  }))
}

// ─── función base para peticiones JSON ────────────────────────

async function request(method, endpoint, body = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' }

  if (requiresAuth) {
    const token = storage.getAccessToken()
    if (!token) throw new Error('No hay token de acceso')
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = { method, headers }
  if (body !== null) config.body = JSON.stringify(body)

  let response
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config)
  } catch {
    throw new Error('No se pudo conectar con el backend. Verifica que API esté activa en http://127.0.0.1:8000')
  }

  if (response.status === 401 && requiresAuth) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return request(method, endpoint, body, requiresAuth)
    storage.clear()
    emitAuthChanged()
    window.location.pathname = '/'
    return
  }

  if (!response.ok) {
    let errorMessage = 'Error en la petición'

    try {
      const error = await response.json()
      errorMessage = error.detail || error.message || errorMessage
    } catch {
      const text = await response.text()
      if (text) errorMessage = text
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

// ─── refresh — el token va en header ──────────────────────────

async function refreshAccessToken() {
  try {
    const refreshToken = storage.getRefreshToken()
    if (!refreshToken) return false

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'refresh-token': refreshToken },  // va en header, no en body
    })

    if (!response.ok) return false

    const tokenData = await response.json()
    const newAccessToken = tokenData.access_token || tokenData.accessToken || tokenData
    const newRefreshToken = tokenData.refresh_token || tokenData.refreshToken || refreshToken
    storage.setTokens(newAccessToken, newRefreshToken)
    return true

  } catch {
    return false
  }
}

// ─── auth service ──────────────────────────────────────────────

export const authService = {

  async signup(fullName, username, email, password) {
    // signup sí recibe JSON y devuelve JSON
    return request('POST', '/auth/signup', {
      full_name: fullName,
      username,
      email,
      password,
    })
  },

  async login(username, password) {
    // login usa FormData — OAuth2 estándar
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,  // sin Content-Type — el navegador lo pone solo con FormData
    })

    if (!response.ok) {
      let errorMessage = 'Credenciales incorrectas'
      try {
        const error = await response.json()
        errorMessage = error.detail || errorMessage
      } catch {
        const text = await response.text()
        if (text) errorMessage = text
      }
      throw new Error(errorMessage)
    }

    const tokenData = await response.json()
    const accessToken = tokenData.access_token || tokenData.accessToken || tokenData
    const refreshToken = tokenData.refresh_token || tokenData.refreshToken || null
    storage.setTokens(accessToken, refreshToken)
    emitAuthChanged()
    return tokenData
  },

  logout() {
    storage.clear()
    emitAuthChanged()
    window.location.pathname = '/'
  },

}

export const accountService = {
  getMyInfo() {
    return request('GET', '/me/', null, true)
  },

  updateMyInfo({ fullName, username, email }) {
    return request('PUT', '/me/', {
      full_name: fullName,
      username,
      email,
    }, true)
  },

  async deleteMyAccount() {
    const response = await request('DELETE', '/me/', null, true)
    storage.clear()
    emitAuthChanged()
    return response
  },
}

// ─── products service ──────────────────────────────────────────

export const productsService = {
  /**
   * Obtiene todos los productos con paginación y búsqueda
   * @param {number} page - Número de página (default: 1)
   * @param {number} limit - Cantidad de items por página (default: 10, max: 100)
   * @param {string} search - Término de búsqueda en el título (default: "")
   * @returns {Promise<{ success: boolean, products: Array, total_pages: number, current_page: number, items_per_page: number }>}
   */
  getAllProducts(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search,
    })
    return request('GET', `/products/?${params.toString()}`, null, false)
  },

  /**
   * Obtiene un producto específico por ID
   * @param {number} productId - ID del producto
   * @returns {Promise<{ id: number, title: string, description: string, price: number, image_url: string, stock: number, category_id: number, ... }>}
   */
  getProductById(productId) {
    return request('GET', `/products/${productId}`, null, false)
  },

  /**
   * Crea un nuevo producto (requiere autenticación y rol admin)
   * @param {Object} product - Datos del producto
   * @param {string} product.title - Título del producto
   * @param {string} product.description - Descripción del producto
   * @param {number} product.price - Precio del producto
   * @param {string} product.image_url - URL de la imagen
   * @param {number} product.stock - Stock disponible
   * @param {number} product.category_id - ID de la categoría
   * @returns {Promise<Object>} Producto creado
   */
  createProduct(product) {
    return request('POST', '/products/', product, true)
  },

  /**
   * Actualiza un producto existente (requiere autenticación y rol admin)
   * @param {number} productId - ID del producto
   * @param {Object} product - Datos del producto a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  updateProduct(productId, product) {
    return request('PUT', `/products/${productId}`, product, true)
  },

  /**
   * Elimina un producto (requiere autenticación y rol admin)
   * @param {number} productId - ID del producto
   * @returns {Promise<Object>} Producto eliminado
   */
  deleteProduct(productId) {
    return request('DELETE', `/products/${productId}`, null, true)
  },
}