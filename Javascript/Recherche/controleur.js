import Model from './model.js';
import View from './view.js';

export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.init();
    }

    init() {
        this.loadGenres();
        this.displayFavorites();
        this.setupEventListeners();
    }

    async loadGenres() {
        const genres = await this.model.loadGenres();
        this.view.displayGenres(genres);
    }

    displayFavorites() {
        this.view.displayFavorites(this.model.favorites);
    }

    setupEventListeners() {
        this.view.searchInput.addEventListener('input', () => {
            this.view.searchButton.disabled = this.view.searchInput.value.trim() === '';
        });

        this.view.searchButton.addEventListener('click', () => this.handleSearch());
        this.view.applyFiltersButton.addEventListener('click', () => this.handleSearch());
        this.view.prevPageButton.addEventListener('click', () => this.handlePageChange(-1));
        this.view.nextPageButton.addEventListener('click', () => this.handlePageChange(1));

        this.view.favoritesList.addEventListener('click', (e) => this.handleFavoriteClick(e));
        this.view.resultsContainer.addEventListener('click', (e) => this.handleMovieClick(e));
    }

    async handleSearch() {
        const searchTerm = this.view.searchInput.value.trim();
        if (searchTerm) {
            const filters = this.getFilters();
            this.view.showLoading();
            try {
                const movies = await this.model.searchMovies(searchTerm, filters, 1);
                this.view.displayMovies(movies, (id) => this.model.isFavorite(id));
                this.view.updatePaginationButtons(this.model.currentPage, this.model.totalPages);
            } catch (error) {
                this.view.showError('Erreur lors de la recherche.');
            }
        }
    }

    async handlePageChange(direction) {
        const newPage = this.model.currentPage + direction;
        if (newPage >= 1 && newPage <= this.model.totalPages) {
            const searchTerm = this.view.searchInput.value.trim();
            const filters = this.getFilters();
            this.view.showLoading();
            try {
                const movies = await this.model.searchMovies(searchTerm, filters, newPage);
                this.view.displayMovies(movies, (id) => this.model.isFavorite(id));
                this.view.updatePaginationButtons(this.model.currentPage, this.model.totalPages);
            } catch (error) {
                this.view.showError('Erreur lors du changement de page.');
            }
        }
    }

    handleFavoriteClick(e) {
        if (e.target.closest('button')) {
            const li = e.target.closest('li');
            const favoriteTitle = li.textContent.trim();
            const favorite = this.model.favorites.find(f => f.title === favoriteTitle);
            if (favorite) {
                this.model.toggleFavorite(favorite);
                this.displayFavorites();
            }
        } else if (e.target.closest('li')) {
            const favoriteTitle = e.target.textContent.trim();
            this.view.searchInput.value = favoriteTitle;
            this.handleSearch();
        }
    }

    handleMovieClick(e) {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            if (e.target.closest('.favorite-button')) {
                const title = movieCard.querySelector('h3').textContent;
                const id = parseInt(movieCard.dataset.id);
                this.model.toggleFavorite({ id, title });
                this.view.updateFavoriteButton(e.target.closest('.favorite-button'), this.model.isFavorite(id));
                this.displayFavorites();
            } else if (e.target.tagName === 'IMG') {
                const id = movieCard.dataset.id;
                window.location.href = `movie-details.html?id=${id}`;
            }
        }
    }

    getFilters() {
        return {
            genre: this.view.genreFilter.value,
            year: this.view.yearFilter.value,
            rating: this.view.ratingFilter.value
        };
    }
}

// Initialisation
const app = new Controller(new Model(), new View());

