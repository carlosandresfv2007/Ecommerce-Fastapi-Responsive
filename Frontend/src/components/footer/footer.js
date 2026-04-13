// src/components/footer.js

export function renderFooter() {
  document.getElementById('footer').innerHTML = `
    <footer>
      <div class="enlaces-rapidos">
        <h3 class="footer-title">Enlaces Rápidos</h3>
        <a href="#" class="footer-link">Buscador</a>
        <a href="#" class="footer-link">Términos y Condiciones</a>
        <a href="#" class="footer-link">Política de Privacidad</a>
        <a href="#" class="footer-link">Centro de Ayuda</a>
        <a href="#" class="footer-link">Contáctanos</a>
      </div>
      <div class="categorias">
        <h3 class="footer-title">Categorías</h3>
        <a href="#" class="footer-link">Calzado</a>
        <a href="#" class="footer-link">Ropa</a>
        <a href="#" class="footer-link">Tecnología</a>
        <a href="#" class="footer-link">Hogar</a>
        <a href="#" class="footer-link">Libros</a>
        <a href="#" class="footer-link">Juegos</a>
      </div>
      <div class="boletin-correo">
        <h3 class="footer-title">Suscribete a nuestro boletín</h3>
        <p>Recibe ofertas exclusivas y novedades directamente en tu correo.</p>
        <form id="newsletter-form">
          <input type="email" placeholder="Tu Email" required>
        </form>
      </div>
      <div class="paises-cobertura">
        <h3 class="footer-title">Cobertura Global</h3>
        <p>Colombia</p>
        <p>Perú</p>
        <p>Chile</p>
        <p>Argentina</p>
        <p>Brasil</p>
      </div>
    </footer>
  `
}