// src/app/router.js

import { renderHome } from '../pages/home/home.js'
import { renderAccountPage } from '../pages/account/account.js'
import { renderProductsPage } from '../pages/prodcuts/products.js'
import { openModal }       from '../components/modal/authModal.js'
import { storage }         from '../services/storage.js'

// ─── tabla de rutas ────────────────────────────────────────────

const routes = {
  '/':          renderHome,
  '/home':      renderHome,
  '/products':  renderProductsPage,
  '/login':     () => {
    renderHome()
    openModal('login')
  },
  '/signup':    () => {
    renderHome()
    openModal('signup')
  },
  '/me':        renderAccountPage,
}

// ─── rutas que requieren sesión activa ─────────────────────────

const privateRoutes = ['/me']

// ─── rutas que NO deben verse si ya hay sesión ─────────────────
// evita que un usuario logueado vuelva al login

const guestRoutes = ['/login', '/signup']

// ─── núcleo del router ─────────────────────────────────────────

function render() {
  const path = window.location.pathname

  // si hay sesión y va a una ruta de invitado, manda a home
  if (guestRoutes.includes(path) && storage.isAuthenticated()) {
    navigate('/home')
    return
  }

  // si no hay sesión y va a una ruta privada, manda al login
  if (privateRoutes.includes(path) && !storage.isAuthenticated()) {
    navigate('/login')
    return
  }

  // busca la página en la tabla — si no existe muestra home
  const page = routes[path] || renderHome

  // limpia el contenido anterior
  document.getElementById('app').innerHTML = ''

  // renderiza la página
  page()
}

function navigate(path) {
  window.history.pushState({}, '', path)
  render()
}

function init() {
  // intercepta clicks en enlaces con data-link
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]')
    if (link) {
      e.preventDefault()
      navigate(link.getAttribute('href'))
    }
  })

  // botón de atrás y adelante del navegador
  window.addEventListener('popstate', render)

  // renderiza la página inicial
  render()
}

export const router = { init, navigate }
