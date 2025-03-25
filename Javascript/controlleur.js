import { Model } from './models.js';
import { View } from './view.js';

const Controller = {
    currentMediaType: 'all', // 'all', 'movie', ou 'tv'
    currentSearchTerm: '',  // Stocker le terme de recherche actuel
    currentPage: 1,
    totalPages: 1,
    timeoutId: null, // Pour le "debounce"
    favorites: [],

    init: async function() {
        View.init({
            isFavorite: this.isFavorite.bind(this),
            toggleFavorite: this.toggleFavorite.bind(this),
            searchMovies: this.searchMovies.bind(this),
            getFilters: this.getFilters.bind(this),
            handlePageChange: this.handlePageChange.bind(this),
            removeFavorite: this.removeFavorite.bind(this)
        });
        this.favorites = Model.getFavorites();
        View.displayFavorites(this.favorites);
        try {
            const genres = await Model.loadGenres();
            View.displayGenres(genres);
        } catch (error) {
            View.showNotification('Erreur lors du chargement des genres.');
        }

        // Gestion des clics sur les liens du menu
        View.homeLink.addEventListener('click', (e) => this.handleMediaTypeClick(e, 'all'));
        View.movieLink.addEventListener('click', (e) => this.handleMediaTypeClick(e, 'movie'));
        View.seriesLink.addEventListener('click', (e) => this.handleMediaTypeClick(e, 'tv'));

        // Activer le lien "Accueil" par défaut
        View.setActiveLink(View.homeLink);

        // Désactiver le bouton de recherche initialement
        View.searchButton.disabled = true;

        // Afficher tous les films au chargement de la page
        await this.fetchTrendingMovies();

        // Écouteur d'événements pour l'input de recherche (avec "debounce")
        View.searchInput.addEventListener('input', () => {
            View.searchButton.disabled = View.searchInput.value.trim() === '';
            clearTimeout(this.timeoutId); // Annuler le timeout précédent

            // Cacher les résultats principaux si l'input est vide
            if (View.searchInput.value.trim() === '') {
                View.resultsContainer.innerHTML = ''; // Effacer les résultats
                View.suggestionsContainer.style.display = 'none'; // Cacher les suggestions
                return;
            }

            // Lancer la recherche de suggestions après un délai
            this.timeoutId = setTimeout(() => {
                this.fetchSuggestions(View.searchInput.value.trim());
            }, 300); // Délai de 300ms
        });

        // Écouteur d'événements pour le bouton de recherche
        View.searchButton.addEventListener('click', () => {
            const searchTerm = View.searchInput.value.trim();
            if (searchTerm) {
                this.searchMovies(searchTerm, this.getFilters(), 1);
            }
        });

        // Écouteur d'événements pour appliquer les filtres
        View.applyFiltersButton.addEventListener('click', () => {
            if (this.currentSearchTerm) {
                this.searchMovies(this.currentSearchTerm, this.getFilters(), 1);
            } else {
                this.fetchTrendingMovies();
            }
        });

        // Écouteurs d'événements pour la pagination
        View.prevPageButton.addEventListener('click', () => {
            this.handlePageChange(this.currentPage - 1, this.currentSearchTerm);
        });

        View.nextPageButton.addEventListener('click', () => {
            this.handlePageChange(this.currentPage + 1, this.currentSearchTerm);
        });
    },

    // Rechercher des films/séries
    searchMovies: async function(query, filters = {}, page = 1) {
        View.toggleLoading(true);
        View.resultsContainer.innerHTML = '';
        this.currentSearchTerm = query;
        View.suggestionsContainer.style.display = 'none'; // Cacher les suggestions

        try {
            const data = await Model.searchMovies(query, filters, page);
            View.toggleLoading(false);
            this.currentPage = data.page;
            this.totalPages = data.total_pages;
            View.updatePaginationButtons(this.currentPage, this.totalPages, this.currentSearchTerm);

            if (data.results && data.results.length > 0) {
                let filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

                if (this.currentMediaType !== 'all') {
                    filteredResults = filteredResults.filter(item => item.media_type === this.currentMediaType);
                }

                if (filters.rating) {
                    filteredResults = filteredResults.filter(item => item.vote_average >= parseFloat(filters.rating));
                }
                View.displayResults(filteredResults);
            } else {
                View.resultsContainer.textContent = '(Aucun résultat trouvé)';
            }
        } catch (error) {
            View.toggleLoading(false);
            View.resultsContainer.textContent = 'Erreur lors de la recherche.';
            console.error(error);
            View.showNotification('Erreur lors de la recherche.');
        }
    },

    // Afficher les films populaires (sans recherche)
    fetchTrendingMovies: async function(page = 1) {
        View.toggleLoading(true);
        View.resultsContainer.innerHTML = '';
        this.currentSearchTerm = '';  // Effacer le terme de recherche
        View.suggestionsContainer.style.display = 'none'; // Cacher les suggestions

        try {
            const data = await Model.fetchTrendingMovies(page);
            View.toggleLoading(false);
            this.currentPage = data.page;
            this.totalPages = data.total_pages;
            View.updatePaginationButtons(this.currentPage, this.totalPages, this.currentSearchTerm);

            if (data.results && data.results.length > 0) {
                let filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

                if (this.currentMediaType !== 'all') {
                    filteredResults = filteredResults.filter(item => item.media_type === this.currentMediaType);
                }

                View.displayResults(filteredResults);
            } else {
                View.resultsContainer.textContent = '(Aucun résultat trouvé)';
            }
        } catch (error) {
            View.toggleLoading(false);
            View.resultsContainer.textContent = 'Erreur lors du chargement des films populaires.';
            console.error(error);
            View.showNotification('Erreur lors du chargement des films populaires.');
        }
    },

    // Afficher les suggestions de recherche
    fetchSuggestions: async function(query) {
        try {
            const suggestions = await Model.fetchSuggestions(query);
            View.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
            View.showNotification('Erreur lors de la récupération des suggestions.');
        }
    },

    // Basculer l'état de favori
    toggleFavorite: function(item) {
        const isFavorite = this.isFavorite(item);
        if (isFavorite) {
            Model.removeFavorite(item);
            View.showNotification('Retiré des favoris');
        } else {
            Model.addFavorite(item);
            View.showNotification('Ajouté aux favoris');
        }
        this.favorites = Model.getFavorites();
        View.displayFavorites(this.favorites);
    },

    // Retirer un favori
    removeFavorite: function(item) {
        Model.removeFavorite(item);
        this.favorites = Model.getFavorites();
        View.displayFavorites(this.favorites);
    },

    // Vérifier si un élément est favori
    isFavorite: function(item) {
        return this.favorites.some(fav => fav.id === item.id && fav.media_type === item.media_type);
    },

    // Récupérer les filtres
    getFilters: function() {
        return {
            genre: View.genreFilter.value,
            year: View.yearFilter.value,
            rating: View.ratingFilter.value
        };
    },

    // Gérer le clic sur les liens du menu
    handleMediaTypeClick: function(event, mediaType) {
        event.preventDefault();
        this.currentMediaType = mediaType;

        if (View.searchInput.value.trim()) {
            const filters = this.getFilters();
            this.searchMovies(View.searchInput.value.trim(), filters, 1);
        } else {
            this.fetchTrendingMovies();
        }

        View.setActiveLink(event.target);
    },

    // Gérer le changement de page
    handlePageChange: function(pageNum, currentSearchTerm) {
        if (pageNum < 1 || pageNum > this.totalPages) {
            return;
        }

        this.currentPage = pageNum;
        if (currentSearchTerm) {
            const filters = this.getFilters();
            this.searchMovies(currentSearchTerm, filters, pageNum);
        } else {
            this.fetchTrendingMovies(pageNum);
        }
    },
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    Controller.init();
});

