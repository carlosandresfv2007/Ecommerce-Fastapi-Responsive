
export function createProductCard(product) {
  const item = product?.data ?? product ?? {}
  const card = document.createElement('a')
  card.className = 'product-card'
  card.setAttribute('data-link', '')

  const productId = item.id
  card.href = productId ? `/products/${productId}` : '/products'

  // imagen — si no hay imagen muestra un placeholder
  const imageUrl = item.thumbnail || item.image_url || item.images?.[0] || '/assets/img/placeholder.png'
  const discountPercentage = toNumber(item.discount_percentage)
  const reviewCount = getReviewCount(item)
  const filledStars = Math.max(0, Math.min(5, reviewCount))
  const numericPrice = toNumber(item.price)
  const hasValidPrice = Number.isFinite(numericPrice)

  const previousPrice = hasValidPrice && discountPercentage > 0
    ? numericPrice / (1 - discountPercentage / 100)
    : null

  const media = document.createElement('div')
  media.className = 'product-card__media'

  if (discountPercentage > 0) {
    const badge = document.createElement('span')
    badge.className = 'product-card__discount-badge'
    badge.textContent = `↓ Ahorra ${Math.round(discountPercentage)}%`
    media.appendChild(badge)
  }

  const img = document.createElement('img')
  img.className = 'product-card__img'
  img.src = imageUrl
  img.alt = item.title || 'Producto'
  img.loading = 'lazy'
  // evita que el drag mueva la imagen en vez del track
  img.draggable = false

  media.appendChild(img)

  const body = document.createElement('div')
  body.className = 'product-card__body'

  const name = document.createElement('p')
  name.className = 'product-card__name'
  name.textContent = item.title || 'Producto sin nombre'

  const priceRow = document.createElement('div')
  priceRow.className = 'product-card__price-row'

  const price = document.createElement('p')
  price.className = 'product-card__price'
  price.textContent = hasValidPrice
    ? formatCurrency(numericPrice)
    : 'Precio no disponible'

  const oldPrice = document.createElement('p')
  oldPrice.className = 'product-card__price-old'
  oldPrice.textContent = previousPrice ? formatCurrency(previousPrice) : ''
  oldPrice.hidden = !previousPrice

  priceRow.appendChild(price)
  priceRow.appendChild(oldPrice)

  const rating = document.createElement('div')
  rating.className = 'product-card__rating'

  const stars = document.createElement('div')
  stars.className = 'product-card__stars'
  stars.setAttribute('aria-label', `${filledStars} de 5 estrellas`)

  for (let index = 0; index < 5; index += 1) {
    const star = document.createElement('span')
    star.className = `product-card__star${index < filledStars ? ' is-filled' : ''}`
    star.textContent = '★'
    stars.appendChild(star)
  }

  const reviews = document.createElement('p')
  reviews.className = 'product-card__reviews'
  reviews.textContent = `(${reviewCount})`

  rating.appendChild(stars)
  rating.appendChild(reviews)

  body.appendChild(name)
  body.appendChild(priceRow)
  body.appendChild(rating)
  card.appendChild(media)
  card.appendChild(body)

  return card
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

function getReviewCount(item) {
  const fromCountField = Number.parseInt(
    item.reviews_count ?? item.review_count ?? item.reviewsCount,
    10,
  )

  if (Number.isFinite(fromCountField) && fromCountField >= 0) {
    return fromCountField
  }

  if (Array.isArray(item.reviews)) {
    return item.reviews.length
  }

  const rating = toNumber(item.rating)
  if (Number.isFinite(rating) && rating > 0) {
    return Math.max(1, Math.round(rating))
  }

  return 0
}

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString('es-CO')}`
}