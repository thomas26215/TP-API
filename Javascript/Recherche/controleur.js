class MovieController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.searchButton.addEventListener('click', () => this.handleSearch());
        this.view.applyFiltersButton.addEventListener('click', () => this.handleSearch());
        this.view.prevPageButton.addEventListener('click', () => this.handlePagination(-1));
        this.view.nextPageButton.addEventListener('click', () => this.handlePagination(1));
        this.view.searchInput.addEventListener('input', () => this.updateSearchButtonState());

        this.init();
    }

    async init() {
        const genres = await this.model.loadGenres();
        this.view.displayGenres(genres);
        this.view.displayFavorites(this.model.favorites);
    }

    async handleSearch() {
        const searchTerm = this.view.searchInput.value.trim();
        const filters = this.view.getFilters();
        if (searchTerm) {
            this.view.loadingGif.style.display = 'block';
            const movies = await this.model.searchMovies(searchTerm, filters, 1);
            this.view.displayMovies(movies, (id) => this.model.isFavorite(id));
            this.view.updatePaginationButtons(this.model.currentPage, this.model.totalPages);
        }
    }

    async handlePagination(direction) {
        const newPage = this.model.currentPage + direction;
        if (newPage >= 1 && newPage <= this.model.totalPages) {
            const searchTerm = this.view.searchInput.value.trim();
            const filters = this.view.getFilters();
            this.view.loadingGif.style.display = 'block';
            const movies = await this.model.searchMovies(searchTerm, filters, newPage);
            this.view.displayMovies(movies, (id) => this.model.isFavorite(id));
            this.view.updatePaginationButtons(this.model.currentPage, this.model.totalPages);
        }
    }

    updateSearchButtonState() {
        this.view.searchButton.disabled = this.view.searchInput.value.trim() === '';
    }
}

// Initialisation
const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';
const model = new MovieModel(apiKey);
const view = new MovieView();
const controller = new MovieController(model, view);
