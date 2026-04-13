    import { productsService } from '../../services/api.js'
import { createProductCard } from '../../components/productcard/productcard.js'

const DEFAULT_PAGE_SIZE = 12
const PAGE_SIZE_OPTIONS = [8, 12, 16, 24]
const VIEW_STORAGE_KEY = 'products-view-mode'

export async function renderProductsPage() {
	const app = document.getElementById('app')
	const state = createInitialStateFromUrl()

	app.innerHTML = `
		<section class="products-page" id="products-page">
			<p class="products-breadcrumb" id="products-breadcrumb"></p>

			<div class="products-panel">
				<header class="products-header">
					<h1 class="products-title" id="products-title"></h1>

					<div class="products-toolbar">
						<p class="products-count" id="products-count"></p>

						<label class="products-per-page" for="products-per-page-select">
							<span>Mostrar:</span>
							<select id="products-per-page-select" aria-label="Seleccionar productos por pagina">
								${PAGE_SIZE_OPTIONS.map((value) => `<option value="${value}">${value}</option>`).join('')}
							</select>
							<span>por pagina</span>
						</label>

						<div class="products-view" role="group" aria-label="Cambiar tipo de vista">
							<span class="products-view__label">Ver</span>
							<button class="products-view__btn" id="view-grid-btn" type="button" data-view="grid" aria-label="Vista en cuadricula">
								${gridIcon()}
							</button>
							<button class="products-view__btn" id="view-list-btn" type="button" data-view="list" aria-label="Vista en lista">
								${listIcon()}
							</button>
						</div>
					</div>
				</header>

				<p class="products-feedback" id="products-feedback" hidden></p>

				<div class="products-grid" id="products-grid" aria-live="polite"></div>

				<nav class="products-pagination" id="products-pagination" aria-label="Paginacion de productos">
					<button class="products-page-btn" id="products-prev" type="button">Anterior</button>
					<p class="products-page-indicator" id="products-page-indicator"></p>
					<button class="products-page-btn" id="products-next" type="button">Siguiente</button>
				</nav>
			</div>
		</section>
	`

	state.elements = getDomReferences()
	bindUiEvents(state)
	updateStaticTexts(state)
	syncNavbarSearchInputs(state.search)

	await fetchAndRenderProducts(state)
}

function createInitialStateFromUrl() {
	const params = new URLSearchParams(window.location.search)
	const search = (params.get('search') || '').trim()

	const pageFromUrl = toPositiveInteger(params.get('page'), 1)
	const limitFromUrl = toPositiveInteger(params.get('limit'), DEFAULT_PAGE_SIZE)

	const viewFromUrl = params.get('view')
	const savedView = localStorage.getItem(VIEW_STORAGE_KEY)
	const view = isValidView(viewFromUrl)
		? viewFromUrl
		: isValidView(savedView)
			? savedView
			: 'grid'

	return {
		search,
		page: pageFromUrl,
		limit: PAGE_SIZE_OPTIONS.includes(limitFromUrl) ? limitFromUrl : DEFAULT_PAGE_SIZE,
		view,
		requestId: 0,
		totalItems: 0,
		totalPages: 1,
		currentPage: 1,
		lastRenderedCount: 0,
		elements: null,
	}
}

function getDomReferences() {
	return {
		breadcrumb: document.getElementById('products-breadcrumb'),
		title: document.getElementById('products-title'),
		count: document.getElementById('products-count'),
		perPageSelect: document.getElementById('products-per-page-select'),
		viewGridBtn: document.getElementById('view-grid-btn'),
		viewListBtn: document.getElementById('view-list-btn'),
		feedback: document.getElementById('products-feedback'),
		grid: document.getElementById('products-grid'),
		pagination: document.getElementById('products-pagination'),
		pageIndicator: document.getElementById('products-page-indicator'),
		prevBtn: document.getElementById('products-prev'),
		nextBtn: document.getElementById('products-next'),
	}
}

function bindUiEvents(state) {
	const { perPageSelect, viewGridBtn, viewListBtn, prevBtn, nextBtn } = state.elements

	perPageSelect.value = String(state.limit)

	perPageSelect.addEventListener('change', async (event) => {
		state.limit = Number(event.target.value)
		state.page = 1
		updateUrlFromState(state, 'push')
		await fetchAndRenderProducts(state)
	})

	viewGridBtn.addEventListener('click', () => {
		if (state.view === 'grid') return
		state.view = 'grid'
		localStorage.setItem(VIEW_STORAGE_KEY, state.view)
		applyViewMode(state, true)
		updateUrlFromState(state, 'replace')
	})

	viewListBtn.addEventListener('click', () => {
		if (state.view === 'list') return
		state.view = 'list'
		localStorage.setItem(VIEW_STORAGE_KEY, state.view)
		applyViewMode(state, true)
		updateUrlFromState(state, 'replace')
	})

	prevBtn.addEventListener('click', async () => {
		if (state.currentPage <= 1) return
		state.page = state.currentPage - 1
		updateUrlFromState(state, 'push')
		await fetchAndRenderProducts(state)
	})

	nextBtn.addEventListener('click', async () => {
		if (state.currentPage >= state.totalPages) return
		state.page = state.currentPage + 1
		updateUrlFromState(state, 'push')
		await fetchAndRenderProducts(state)
	})
}

function updateStaticTexts(state) {
	const isSearch = state.search.length > 0
	state.elements.breadcrumb.textContent = isSearch
		? `Inicio > Resultados para "${state.search}"`
		: 'Inicio > Todos los productos'
	state.elements.title.textContent = isSearch
		? `Resultados para "${state.search}"`
		: 'Todos los productos'
}

function syncNavbarSearchInputs(value) {
	const inputs = document.querySelectorAll('.search-input')
	inputs.forEach((input) => {
		input.value = value
	})
}

async function fetchAndRenderProducts(state) {
	const requestId = ++state.requestId
	setFeedback(state, 'Cargando productos...', false)
	state.elements.grid.innerHTML = ''

	try {
		const response = await productsService.getAllProducts(state.page, state.limit, state.search)

		if (requestId !== state.requestId) return

		const data = normalizeProductsResponse(response, state.page, state.limit)
		state.currentPage = data.currentPage
		state.totalPages = data.totalPages
		state.totalItems = data.totalItems
		state.lastRenderedCount = data.products.length
		state.page = state.currentPage

		renderProductsGrid(state, data.products)
		renderCounter(state)
		renderPagination(state)

		if (data.products.length === 0) {
			setFeedback(state, 'No se encontraron productos para esta busqueda.', true)
		} else {
			setFeedback(state, '', true)
		}

		updateUrlFromState(state, 'replace')
	} catch {
		if (requestId !== state.requestId) return

		state.totalItems = 0
		state.totalPages = 1
		state.currentPage = 1
		state.lastRenderedCount = 0

		state.elements.grid.innerHTML = ''
		renderCounter(state)
		renderPagination(state)
		setFeedback(state, 'No se pudieron cargar los productos. Intenta nuevamente.', true)
	}
}

function renderProductsGrid(state, products) {
	const fragment = document.createDocumentFragment()

	products.forEach((product) => {
		const card = createProductCard(product)
		fragment.appendChild(card)
	})

	state.elements.grid.innerHTML = ''
	state.elements.grid.appendChild(fragment)
	applyViewMode(state, false)
}

function renderCounter(state) {
	const total = state.totalItems
	const start = total === 0 ? 0 : (state.currentPage - 1) * state.limit + 1
	const end = total === 0 ? 0 : start + state.lastRenderedCount - 1

	state.elements.count.innerHTML = `
		<span class="products-count__range">${start} - ${end} de ${total} Resultados</span>
		<span class="products-count__total">${total} Resultados</span>
	`
}

function renderPagination(state) {
	state.elements.pageIndicator.textContent = `Pagina ${state.currentPage} de ${state.totalPages}`
	state.elements.prevBtn.disabled = state.currentPage <= 1
	state.elements.nextBtn.disabled = state.currentPage >= state.totalPages
}

function applyViewMode(state, animate) {
	const { grid, viewGridBtn, viewListBtn } = state.elements
	const isList = state.view === 'list'

	grid.classList.toggle('is-list', isList)

	viewGridBtn.classList.toggle('is-active', !isList)
	viewGridBtn.setAttribute('aria-pressed', String(!isList))

	viewListBtn.classList.toggle('is-active', isList)
	viewListBtn.setAttribute('aria-pressed', String(isList))

	if (animate) {
		grid.classList.remove('view-swap')
		void grid.offsetWidth
		grid.classList.add('view-swap')
	}
}

function setFeedback(state, message, hideWhenEmpty) {
	const hasMessage = Boolean(message)
	if (hideWhenEmpty && !hasMessage) {
		state.elements.feedback.hidden = true
		state.elements.feedback.textContent = ''
		return
	}

	state.elements.feedback.hidden = false
	state.elements.feedback.textContent = message
}

function updateUrlFromState(state, historyMode = 'replace') {
	const params = new URLSearchParams()

	if (state.search) params.set('search', state.search)
	if (state.page > 1) params.set('page', String(state.page))
	if (state.limit !== DEFAULT_PAGE_SIZE) params.set('limit', String(state.limit))
	if (state.view !== 'grid') params.set('view', state.view)

	const query = params.toString()
	const nextUrl = query ? `/products?${query}` : '/products'

	if (historyMode === 'push') {
		window.history.pushState({}, '', nextUrl)
		return
	}

	window.history.replaceState({}, '', nextUrl)
}

function normalizeProductsResponse(response, fallbackPage, fallbackLimit) {
	const products = Array.isArray(response?.products)
		? response.products
		: Array.isArray(response?.data)
			? response.data
			: Array.isArray(response?.items)
				? response.items
				: []

	const currentPage = toPositiveInteger(response?.current_page ?? response?.page, fallbackPage)
	const itemsPerPage = toPositiveInteger(response?.items_per_page ?? response?.limit, fallbackLimit)

	const reportedTotalItems = toPositiveInteger(
		response?.total ?? response?.total_items ?? response?.count,
		0,
	)
	const reportedTotalPages = toPositiveInteger(response?.total_pages, 0)

	const totalPages = reportedTotalPages || Math.max(1, Math.ceil(reportedTotalItems / itemsPerPage) || 1)
	const estimatedTotalFromPage = (currentPage - 1) * itemsPerPage + products.length
	const totalItems = Math.max(reportedTotalItems, estimatedTotalFromPage)

	return {
		products,
		currentPage,
		itemsPerPage,
		totalPages,
		totalItems,
	}
}

function toPositiveInteger(value, fallback) {
	const parsed = Number.parseInt(value, 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function isValidView(view) {
	return view === 'grid' || view === 'list'
}

function gridIcon() {
	return `
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="3" y="3" width="7" height="7" rx="1.25"></rect>
			<rect x="14" y="3" width="7" height="7" rx="1.25"></rect>
			<rect x="3" y="14" width="7" height="7" rx="1.25"></rect>
			<rect x="14" y="14" width="7" height="7" rx="1.25"></rect>
		</svg>
	`
}

function listIcon() {
	return `
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="3" y="4" width="18" height="3" rx="1.25"></rect>
			<rect x="3" y="10.5" width="18" height="3" rx="1.25"></rect>
			<rect x="3" y="17" width="18" height="3" rx="1.25"></rect>
		</svg>
	`
}
