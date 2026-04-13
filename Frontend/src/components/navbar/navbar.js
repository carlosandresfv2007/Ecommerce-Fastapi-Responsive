// src/components/navbar.js
import { openModal } from '../modal/authModal.js'
import { storage } from '../../services/storage.js'
import { router } from '../../app/router.js'

export function renderNavbar() {
  const isAuthenticated = storage.isAuthenticated()
  const arrowIcon = () => `
  <svg width="13" height="13" viewBox="0 0 24 24">
    <polyline 
      points="4,8 12,16 20,8"
      fill="none"
      stroke="black"
      stroke-width="3"
    />
  </svg>
`;

  const searchIcon = () => `
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5"></circle>
    <path d="M16.2 16.2L21 21" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
  </svg>
`;

const accoutnsIcon = () => `
<svg class="users-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle class="icon-bg" cx="50" cy="50" r="48" />

  <circle class="icon-figure" cx="62" cy="40" r="13" />

  <circle class="icon-figure" cx="36" cy="44" r="10" />

  <path class="icon-figure" d="M 46 88 C 48 65, 80 65, 84 83 C 74 92, 58 93, 46 88 Z" />

  <path class="icon-figure" d="M 18 77 C 20 62, 40 60, 46 68 C 43 75, 43 82, 45 88 C 32 90, 22 85, 18 77 Z" />

  <path class="icon-separator" d="M 45 68 C 42 75, 42 82, 45 88" />
</svg>
`;

const authAction = isAuthenticated
  ? `
      <a href="/me" data-link class="btn-link">
      <span class="acc-links-container">
        Mi cuenta ${arrowIcon()} 
      </span>
        ${accoutnsIcon()}
      </a>  
  `
  : `
    <p class="acc-links-container">Iniciar sesión / Registrar</p>
    <button class="btn-link" id="btn-login">
        <span class="acc-links-container"> Mi cuenta ${arrowIcon()} </span>
      ${accoutnsIcon()}
    </button>
`;

  document.getElementById('navbar').innerHTML = `
    <div class="navbar-shell">
      <nav class="navbar">
        <div class="nav-inner">
          <a href="/home" data-link>
            <img src="https://bulevartienda.com/cdn/shop/files/logo-web-bt_180x@2x.png?v=1700494863" alt="Logo" class="logo">
          </a>
          <div class="search-container search-container--desktop">
            <input type="text" placeholder="Buscar..." class="search-input">
            <button class="search-button" type="button" aria-label="Buscar">
              <img src="/assets/img/boton-busqueda.png" alt="Search" class="search-icon">
            </button>
          </div>
          <button class="search-toggle" id="search-toggle" type="button" aria-label="Abrir buscador" aria-expanded="false" aria-controls="mobile-search-panel">
            ${searchIcon()}
          </button>
          <div class="nav-actions">
            <div class="acc-container">
            ${authAction}
            </div> 
            <a class="cart-container" href="/cart" data-link>
              <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="cart-icon">
                <rect x="8" y="18" width="24" height="20" rx="4" fill="#0A1157" />
                <path d="M 14 18 v -4 a 6 6 0 0 1 12 0 v 4" fill="none" stroke="#0A1157" stroke-width="2.5" />
                <path d="M 14 18 v 3 a 6 6 0 0 0 12 0 v -3" fill="none" stroke="#FFFFFF" stroke-width="2" />

                <g class="badge-group">
                  <circle cx="34" cy="14" r="10" fill="#4ADE80" />
                  <text id="cart-count" x="34" y="18.5" font-family="system-ui, sans-serif" font-weight="700" font-size="13" fill="#FFFFFF" text-anchor="middle">0</text>
                </g>
              </svg>
              <p class="acc-links-container">Carrito</p>
            </a>
          </div>
        </div>
      </nav>
      <div class="mobile-search-panel" id="mobile-search-panel" aria-hidden="true">
        <div class="search-container search-container--mobile">
          <input type="text" placeholder="Buscar..." class="search-input">
          <button class="search-button" type="button" aria-label="Buscar">
            <img src="/assets/img/boton-busqueda.png" alt="Search" class="search-icon">
          </button>
        </div>
      </div>
    </div>
  `

  const loginBtn = document.getElementById('btn-login')
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      openModal('login', loginBtn)
    })
  }

  const searchToggle = document.getElementById('search-toggle')
  const mobileSearchPanel = document.getElementById('mobile-search-panel')
  const mobileSearchInput = mobileSearchPanel?.querySelector('.search-input')
  const desktopSearchInput = document.querySelector('.search-container--desktop .search-input')

  function runSearch(term) {
    const normalized = (term || '').trim()
    const url = normalized
      ? `/products?search=${encodeURIComponent(normalized)}`
      : '/products'

    router.navigate(url)

    if (searchToggle && mobileSearchPanel && mobileSearchPanel.classList.contains('is-open')) {
      mobileSearchPanel.classList.remove('is-open')
      searchToggle.setAttribute('aria-expanded', 'false')
      mobileSearchPanel.setAttribute('aria-hidden', 'true')
    }
  }

  function bindSearch(containerSelector) {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const input = container.querySelector('.search-input')
    const button = container.querySelector('.search-button')
    if (!input || !button) return

    button.addEventListener('click', () => {
      runSearch(input.value)
    })

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      runSearch(input.value)
    })

    input.addEventListener('input', () => {
      if (desktopSearchInput && input !== desktopSearchInput) {
        desktopSearchInput.value = input.value
      }
      if (mobileSearchInput && input !== mobileSearchInput) {
        mobileSearchInput.value = input.value
      }
    })
  }

  if (searchToggle && mobileSearchPanel) {
    searchToggle.addEventListener('click', () => {
      const isOpen = mobileSearchPanel.classList.toggle('is-open')
      searchToggle.setAttribute('aria-expanded', String(isOpen))
      mobileSearchPanel.setAttribute('aria-hidden', String(!isOpen))

      if (isOpen && mobileSearchInput) {
        mobileSearchInput.focus()
      }
    })
  }

  bindSearch('.search-container--desktop')
  bindSearch('.search-container--mobile')
}


