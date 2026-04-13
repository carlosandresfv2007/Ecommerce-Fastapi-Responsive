// src/pages/account/account.js

import { accountService } from '../../services/api.js'
import { router } from '../../app/router.js'

function formatCreatedAt(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function setFeedback(message, isError = false) {
  const feedback = document.getElementById('account-feedback')
  if (!feedback) return
  feedback.textContent = message
  feedback.classList.toggle('account-feedback--error', isError)
  feedback.classList.toggle('account-feedback--success', !isError)
}

function disableEditableInputs() {
  const inputs = document.querySelectorAll('.account-editable input')
  inputs.forEach((input) => {
    input.disabled = true
    input.classList.remove('account-input--editing')
  })
}

function bindEditButtons() {
  const editButtons = document.querySelectorAll('.edit-field-btn')
  editButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const inputId = button.dataset.target
      const input = document.getElementById(inputId)
      if (!input) return
      input.disabled = false
      input.classList.add('account-input--editing')
      input.focus()
      input.select()
    })
  })
}

function renderAccountContent(user) {
  const app = document.getElementById('app')
  app.innerHTML = `
    <section class="account-page">
      <header class="account-header">
        <h1>Mi cuenta</h1>
        <p>Consulta tus datos y actualiza la información editable.</p>
      </header>

      <div class="account-card">
        <div class="account-grid">
          <div class="account-row">
            <span class="account-label">ID</span>
            <span class="account-value">${user.id}</span>
          </div>

          <div class="account-row">
            <span class="account-label">Rol</span>
            <span class="account-value">${user.role}</span>
          </div>

          <div class="account-row">
            <span class="account-label">Estado</span>
            <span class="account-value">${user.is_active ? 'Activo' : 'Inactivo'}</span>
          </div>

          <div class="account-row">
            <span class="account-label">Fecha de creación</span>
            <span class="account-value">${formatCreatedAt(user.created_at)}</span>
          </div>

          <div class="account-row account-row--editable">
            <label class="account-label" for="full-name-input">Nombre completo</label>
            <div class="account-editable">
              <input id="full-name-input" type="text" value="${user.full_name}" disabled>
              <button type="button" class="edit-field-btn" data-target="full-name-input" aria-label="Editar nombre completo">✎</button>
            </div>
          </div>

          <div class="account-row account-row--editable">
            <label class="account-label" for="username-input">Usuario</label>
            <div class="account-editable">
              <input id="username-input" type="text" value="${user.username}" disabled>
              <button type="button" class="edit-field-btn" data-target="username-input" aria-label="Editar usuario">✎</button>
            </div>
          </div>

          <div class="account-row account-row--editable">
            <label class="account-label" for="email-input">Email</label>
            <div class="account-editable">
              <input id="email-input" type="email" value="${user.email}" disabled>
              <button type="button" class="edit-field-btn" data-target="email-input" aria-label="Editar email">✎</button>
            </div>
          </div>
        </div>

        <p id="account-feedback" class="account-feedback"></p>

        <div class="account-actions">
          <button id="account-update-btn" type="button" class="account-btn account-btn--primary">Update</button>
          <button id="account-delete-btn" type="button" class="account-btn account-btn--danger">Delete account</button>
        </div>
      </div>
    </section>
  `

  bindEditButtons()

  document.getElementById('account-update-btn').addEventListener('click', async () => {
    const updateBtn = document.getElementById('account-update-btn')
    const fullName = document.getElementById('full-name-input').value.trim()
    const username = document.getElementById('username-input').value.trim()
    const email = document.getElementById('email-input').value.trim()

    if (!fullName || !username || !email) {
      setFeedback('Todos los campos editables son obligatorios.', true)
      return
    }

    updateBtn.disabled = true
    updateBtn.textContent = 'Actualizando...'
    setFeedback('')

    try {
      await accountService.updateMyInfo({ fullName, username, email })
      disableEditableInputs()
      setFeedback('Cuenta actualizada correctamente.')
    } catch (error) {
      setFeedback(error.message || 'No se pudo actualizar la cuenta.', true)
    } finally {
      updateBtn.disabled = false
      updateBtn.textContent = 'Update'
    }
  })

  document.getElementById('account-delete-btn').addEventListener('click', async () => {
    const confirmed = window.confirm('Esta acción eliminará tu cuenta de forma permanente. ¿Deseas continuar?')
    if (!confirmed) return

    const deleteBtn = document.getElementById('account-delete-btn')
    deleteBtn.disabled = true
    deleteBtn.textContent = 'Eliminando...'
    setFeedback('')

    try {
      await accountService.deleteMyAccount()
      router.navigate('/home')
    } catch (error) {
      setFeedback(error.message || 'No se pudo eliminar la cuenta.', true)
      deleteBtn.disabled = false
      deleteBtn.textContent = 'Delete account'
    }
  })
}

export async function renderAccountPage() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <section class="account-page">
      <div class="account-card account-card--loading">Cargando datos de tu cuenta...</div>
    </section>
  `

  try {
    const response = await accountService.getMyInfo()
    renderAccountContent(response.data)
  } catch (error) {
    app.innerHTML = `
      <section class="account-page">
        <div class="account-card">
          <h1>Mi cuenta</h1>
          <p class="account-feedback account-feedback--error">${error.message || 'No se pudo cargar la cuenta.'}</p>
          <button id="account-back-btn" class="account-btn account-btn--primary" type="button">Volver al dashboard</button>
        </div>
      </section>
    `

    document.getElementById('account-back-btn').addEventListener('click', () => {
      router.navigate('/home')
    })
  }
}
