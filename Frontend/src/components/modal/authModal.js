// src/components/modal/authModal.js

import { authService } from '../../services/api.js'
import { router }      from '../../app/router.js'

// ─── crea el modal en el DOM una sola vez ──────────────

export function initAuthModal() {
  const modal = document.createElement('div')
  modal.id = 'auth-modal'
  modal.className = 'modal-overlay'
  modal.innerHTML = `
    <div class="modal-card">

      <button class="modal-close" id="modal-close">✕</button>

      <!-- ── vista login ── -->
      <div class="modal-view" id="view-login">
        <h2 class="modal-title">Conectarme a mi cuenta</h2>
        <h3 class="modal-subtitle">Ingresa tu E-mail y contraseña: </h3>
        <form id="login-form" novalidate class="login-modal-form">
          <div class="form-group">
            <input type="text" id="login-username" placeholder="Tu usuario" autocomplete="username"/>
            </div>
          <div class="form-group">
            <input type="password" id="login-password" placeholder="Tu contraseña" autocomplete="current-password"/>
          </div>
          <span class="form-error" id="login-error"></span>
          <button type="submit" class="btn-primary" id="login-submit-btn">Entrar</button>
        </form>

        <p class="modal-footer">
          ¿No tienes cuenta?
          <button class="btn-link" id="go-signup">Regístrate</button>
        </p>
      </div>

      <!-- ── vista signup ── -->
      <div class="modal-view modal-view--hidden" id="view-signup">
        <h2 class="modal-title">Crear mi cuenta</h2>
        <h3 class="modal-subtitle">Por favor complete la informacion a continuacion: </h3>
        <form id="signup-form" novalidate>
          <div class="form-group">
            <label for="signup-fullname">Nombre completo</label>
            <input type="text" id="signup-fullname" placeholder="Tu nombre"/>
          </div>
          <div class="form-group">
            <label for="signup-username">Usuario</label>
            <input type="text" id="signup-username" placeholder="Tu usuario"/>
          </div>
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input type="email" id="signup-email" placeholder="tu@email.com"/>
          </div>
          <div class="form-group">
            <label for="signup-password">Contraseña</label>
            <input type="password" id="signup-password" placeholder="Mínimo 8 caracteres"/>
          </div>
          <span class="form-error" id="signup-error"></span>
          <button type="submit" class="btn-primary" id="signup-btn">Crear cuenta</button>
        </form>

        <p class="modal-footer">
          ¿Ya tienes cuenta?
          <button class="btn-link" id="go-login">Inicia sesión</button>
        </p>
      </div>

    </div>
  `

  document.body.appendChild(modal)
  attachModalEvents()
}

// ─── abrir y cerrar ────────────────────────────────────

export function openModal(view = 'login', anchorEl = null) {
  const modal = document.getElementById('auth-modal')
  positionModal(modal, anchorEl)
  modal.classList.add('modal-overlay--visible')
  showView(view)
}

export function closeModal() {
  const modal = document.getElementById('auth-modal')
  modal.classList.remove('modal-overlay--visible')
}

function positionModal(modal, anchorEl) {
  if (!modal) return

  if (!anchorEl) {
    modal.style.top = '80px'
    modal.style.left = 'calc(100vw - 380px)'
    return
  }

  const rect = anchorEl.getBoundingClientRect()
  const panelWidth = 360
  const margin = 12
  let left = rect.left + rect.width / 2 - panelWidth / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin))
  const top = rect.bottom + 10

  modal.style.top = `${top}px`
  modal.style.left = `${left}px`
}

// ─── alternar entre login y signup ────────────────────

function showView(view) {
  const loginView  = document.getElementById('view-login')
  const signupView = document.getElementById('view-signup')

  if (view === 'login') {
    loginView.classList.remove('modal-view--hidden')
    signupView.classList.add('modal-view--hidden')
  } else {
    signupView.classList.remove('modal-view--hidden')
    loginView.classList.add('modal-view--hidden')
  }
}

// ─── eventos ───────────────────────────────────────────

function attachModalEvents() {

  // cerrar con el botón X
  document.getElementById('modal-close').addEventListener('click', closeModal)

  // cerrar al clickear fuera del panel (excepto el botón de login)
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('auth-modal')
    if (!modal.classList.contains('modal-overlay--visible')) return
    if (modal.contains(e.target)) return
    if (e.target.closest('#btn-login')) return
    closeModal()
  })

  // cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
  })

  // alternar vistas
  document.getElementById('go-signup').addEventListener('click', () => showView('signup'))
  document.getElementById('go-login').addEventListener('click',  () => showView('login'))

  // submit login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn      = document.getElementById('login-submit-btn')
    const errorEl  = document.getElementById('login-error')
    const username = document.getElementById('login-username').value.trim()
    const password = document.getElementById('login-password').value.trim()

    if (!username || !password) {
      errorEl.textContent = 'Completa todos los campos'
      return
    }

    btn.disabled    = true
    btn.textContent = 'Entrando...'
    errorEl.textContent = ''

    try {
      await authService.login(username, password)
      closeModal()
      router.navigate('/home')
    } catch (error) {
      errorEl.textContent = error.message
      btn.disabled    = false
      btn.textContent = 'Entrar'
    }
  })

  // submit signup
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn      = document.getElementById('signup-btn')
    const errorEl  = document.getElementById('signup-error')
    const fullName = document.getElementById('signup-fullname').value.trim()
    const username = document.getElementById('signup-username').value.trim()
    const email    = document.getElementById('signup-email').value.trim()
    const password = document.getElementById('signup-password').value.trim()

    if (!fullName || !username || !email || !password) {
      errorEl.textContent = 'Completa todos los campos'
      return
    }

    btn.disabled    = true
    btn.textContent = 'Creando cuenta...'
    errorEl.textContent = ''

    try {
      await authService.signup(fullName, username, email, password)
      // registro exitoso — muestra login con mensaje
      showView('login')
      document.getElementById('login-error').style.color = 'var(--color-success)'
      document.getElementById('login-error').textContent = 'Cuenta creada. Inicia sesión.'
      btn.disabled    = false
      btn.textContent = 'Crear cuenta'
    } catch (error) {
      errorEl.textContent = error.message
      btn.disabled    = false
      btn.textContent = 'Crear cuenta'
    }
  })
}