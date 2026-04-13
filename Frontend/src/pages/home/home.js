// src/pages/home/home.js

import { productsService } from '../../services/api.js'
import { createProductCard } from '../../components/productcard/productcard.js'

export function renderHome() {
  const app = document.getElementById('app')

  app.innerHTML = `
    <div class="home">

      <!-- ── carrusel de imágenes ── -->
      <section class="hero-section">
        <div class="hero-carousel" id="hero-carousel">
          <div class="hero-track" id="hero-track">
            <div class="hero-slide">
              <img src="/assets/img/banner1.jpg" alt="Banner 1"/>
            </div>
            <div class="hero-slide">
              <img src="/assets/img/banner2.jpg" alt="Banner 2"/>
            </div>
          </div>

          <!-- indicadores -->
          <div class="hero-dots">
            <button class="hero-dot hero-dot--active" data-index="0"></button>
            <button class="hero-dot" data-index="1"></button>
          </div>
        </div>
      </section>

      <!-- ── categorías ── -->
      <section class="categories-section">
        <div class="categories-track-wrapper">
          <div class="categories-track" id="categories-track">

            <a class="category-item" data-link href="/category/1">
              <img src="/assets/img/categories/cate1.jpg" alt="Cocina" class="category-icon">
              <span>Cocina</span>
            </a>
            <a class="category-item" data-link href="/category/2">
              <img src="/assets/img/categories/cate2.jpg" alt="Ropa" class="category-icon">
              <span>Ropa</span>
            </a>
            <a class="category-item" data-link href="/category/3">
              <img src="/assets/img/categories/cate3.jpg" alt="Tecnología" class="category-icon">
              <span>Tecnología</span>
            </a>
            <a class="category-item" data-link href="/category/4">
              <img src="/assets/img/categories/cate4.png" alt="Hogar" class="category-icon">
              <span>Hogar</span>
            </a>
            <a class="category-item" data-link href="/category/5">
              <img src="/assets/img/categories/cate5.jpg" alt="Libros" class="category-icon">
              <span>Libros</span>
            </a>
            <a class="category-item" data-link href="/category/6">
              <img src="/assets/img/categories/cate6.jpg" alt="Juegos" class="category-icon">
              <span>Juegos</span>
            </a>
            <a class="category-item" data-link href="/category/7">
              <img src="/assets/img/categories/cate7.jpg" alt="Deportes" class="category-icon">
              <span>Deportes</span>
            </a>
            <a class="category-item" data-link href="/category/8">
              <img src="/assets/img/categories/cate8.jpg" alt="Belleza" class="category-icon">
              <span>Belleza</span>
            </a>

          </div>
        </div>
      </section>

      <!-- ── sección ofertas + productos ── -->

        <section class="offers-section container">
          <div class="offers-wrapper">

            <!-- 1/4 izquierda -->
            <div class="offers-info">
              <h2 class="offers-title">¡Entérate de todas nuestras ofertas!</h2>
              <p class="offers-text">En Bulevar Tienda encuentra los mejores productos y promociones de temporada:</p>
              <a href="/products" data-link class="btn-primary offers-btn">Ver productos</a>
            </div>

            <!-- 3/4 derecha — carrusel de productos -->
            <div class="products-carousel-wrapper">
              <div class="products-carousel" id="products-carousel">
                <div class="products-track" id="products-track">
                  <!-- las cards se inyectan aquí desde JS -->
                  <div class="products-loading">Cargando productos...</div>
                </div>
              </div>
            </div>

          </div>
        </section>
    </div>
  `

  initHeroCarousel()
  initDragScroll('categories-track')
  loadFeaturedProducts()
}

//>>>>>>>>>>>> carrusel de imagenes >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><

function initHeroCarousel() {
  const track  = document.getElementById('hero-track')
  const dots   = document.querySelectorAll('.hero-dot')
  let current  = 0
  let startX   = 0
  let isDragging = false
  let dragDelta  = 0

  function goTo(index) {
    current = index
    track.style.transform = `translateX(-${current * 100}%)`
    dots.forEach((dot, i) => {
      dot.classList.toggle('hero-dot--active', i === current)
    })
  }

  // PUNTOS
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)))
  })

  // drag desktop
  track.addEventListener('mousedown', (e) => {
    isDragging = true
    startX = e.clientX
    track.style.transition = 'none'   
    e.preventDefault()               
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    dragDelta = e.clientX - startX
    // mueve el track siguiendo el mouse en tiempo real
    track.style.transform = `translateX(calc(-${current * 100}% + ${dragDelta}px))`
  })

  document.addEventListener('mouseup', () => {
    if (!isDragging) return
    isDragging = false
    track.style.transition = ''       // reactiva la transicion

    // si arrastro más de 80px cambia de slide
    if (dragDelta < -80 && current < 1) goTo(current + 1)
    else if (dragDelta > 80 && current > 0) goTo(current - 1)
    else goTo(current)                // vuelve al slide actual si no fue suficiente

    dragDelta = 0
  })

  // touch en movil 
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    track.style.transition = 'none'
  }, { passive: true })

  track.addEventListener('touchmove', (e) => {
    dragDelta = e.touches[0].clientX - startX
    track.style.transform = `translateX(calc(-${current * 100}% + ${dragDelta}px))`
  }, { passive: true })

  track.addEventListener('touchend', () => {
    track.style.transition = ''
    if (dragDelta < -80 && current < 1) goTo(current + 1)
    else if (dragDelta > 80 && current > 0) goTo(current - 1)
    else goTo(current)
    dragDelta = 0
  })
}

// >>>>>>>>>>>>>>>>>>>>>>>>> CATEGORIAS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function initDragScroll(elementId) {
  const el     = document.getElementById(elementId)
  let isDown   = false
  let startX   = 0
  let scrollLeft = 0

  //  mouse 
  el.addEventListener('mousedown', (e) => {
    isDown = true
    el.classList.add('dragging')
    startX    = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
    e.preventDefault()
  })

  document.addEventListener('mouseup', () => {
    isDown = false
    el.classList.remove('dragging')
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return
    const x    = e.pageX - el.offsetLeft
    const walk = x - startX          // cuento movio el mouse
    el.scrollLeft = scrollLeft - walk
  })

  //touch 
  el.addEventListener('touchstart', (e) => {
    startX     = e.touches[0].pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
  }, { passive: true })

  el.addEventListener('touchmove', (e) => {
    const x    = e.touches[0].pageX - el.offsetLeft
    const walk = x - startX
    el.scrollLeft = scrollLeft - walk
  }, { passive: true })
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PRODUCTOS DESCUENTO >>>>>>>>>>>>>>>>>>>>>>><

async function loadFeaturedProducts() {
  const track = document.getElementById('products-track')

  try {
    // una sola petición paginada evita inconsistencias y es más eficiente
    const response = await productsService.getAllProducts(1, 6, '')
    const products = Array.isArray(response?.data) ? response.data : []

    if (products.length === 0) {
      track.innerHTML = '<p class="products-error">No hay productos disponibles.</p>'
      return
    }

    // limpia el loading y pinta las cards
    track.innerHTML = ''
    products.forEach(product => {
      track.appendChild(createProductCard(product))
    })

    // despuEs de pintar las cards, habilita el drag
    initDragScroll('products-track')

  } catch (error) {
    track.innerHTML = '<p class="products-error">Error cargando productos.</p>'
  }
}

// Crea una card de producto como nodo del DOM 

