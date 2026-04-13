import { router } from './router.js'
import { renderNavbar } from '../components/navbar/navbar.js'
import { renderFooter } from '../components/footer/footer.js'
import { initAuthModal } from '../components/modal/authModal.js'
import { renderAnnouncement } from '../components/announcement/announcement.js'

document.addEventListener('DOMContentLoaded', () => {
  renderAnnouncement()
  renderNavbar()   // se pinta al iniciar y se vuelve a pintar si cambia la sesión
  renderFooter()   // igual
  initAuthModal()  // el modal se crea una sola vez y se muestra/oculta según se necesite
  router.init()    // el router toma el control del #app

  window.addEventListener('auth-changed', () => {
    renderNavbar()
  })
})