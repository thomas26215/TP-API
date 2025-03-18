// controller.js

import MovieModel from './model.js';
import MovieView from './view.js';

class MovieController {
    constructor() {
        this.model = new MovieModel();
        this.view = new MovieView();

        this.init();
    }

    async init() {
        const genres = await this.model.loadGenres();
        this.view.displayGenres(genres);
        this.view.displayFavorites(this.model.favorites);

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.view.searchButton.addEventListener('click', () => this.handleSearch());
        this.view.applyFiltersButton.addEventListener('click', () => this.handleSearch());
        this.view.prevPageButton.addEventListener('click', () => this.handlePagination(-1));
        this.view.nextPageButton.addEventListener('click', () => this.handlePagination(1));
        // Ajoutez d'autres écouteurs d'événements ici
    }

    async handleSearch() {
        const searchTerm = this.view.searchInput.value.trim();
        const filters = this.view.getFilters();
        if (searchTerm) {
            this.view.showLoading();
            try {
                const movies = await this.model.searchMovies(searchTerm, filters, 1);
                this.view.displayMovies(movies, (id) => this.model.isFavorite(id));
                this.view.updatePaginationButtons(this.model.currentPage, this.model.totalPages);
            } catch (error) {
                console.error('Erreur lors de la recherche:', error);
            } finally {
                this.view.hideLoading();
            }
        }
    }

    async handlePagination(direction) {
        const newPage = this.model.currentPage + direction;
        if (newPage >= 1 && newPage <= this.model.totalPages) {
            const searchTerm = this.view.searchInput.value.trim();
            const filters = this.view.getFilters();
            await this.model.searchMovies(searchTerm, filters, newPage);
            this.handleSearch();
        }
    }

    // Ajoutez d'autres méthodes de contrôleur ici
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    new MovieController();
});

