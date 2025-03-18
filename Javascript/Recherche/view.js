// view.js

export default class MovieView {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.resultsContainer = document.getElementById('results-container');
        this.favoritesList = document.getElementById('favorites-list');
        this.loadingGif = document.getElementById('bloc-gif-attente');
        this.genreFilter = document.getElementById('genre-filter');
        this.yearFilter = document.getElementById('year-filter');
        this.ratingFilter = document.getElementById('rating-filter');
        this.applyFiltersButton = document.getElementById('apply-filters');
        this.prevPageButton = document.getElementById('prev-page');
        this.nextPageButton = document.getElementById('next-page');
    }

    displayGenres(genres) {
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            this.genreFilter.appendChild(option);
        });
    }

    displayFavorites(favorites) {
        this.favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            const li = document.createElement('li');
            li.textContent = '(Aucune recherche favorite)';
            this.favoritesList.appendChild(li);
        } else {
            favorites.forEach(favorite => {
                const li = document.createElement('li');
                li.textContent = favorite.title;
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-times"></i>';
                li.appendChild(deleteButton);
                this.favoritesList.appendChild(li);
            });
        }
    }

    displayMovies(movies, isFavorite) {
        this.resultsContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie, isFavorite(movie.id));
            this.resultsContainer.appendChild(movieCard);
        });
    }

    createMovieCard(movie, isFavorite) {
        // Code pour créer une carte de film (similaire à votre code original)
    }

    updatePaginationButtons(currentPage, totalPages) {
        this.prevPageButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
        this.nextPageButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    }

    showLoading() {
        this.loadingGif.style.display = 'block';
    }

    hideLoading() {
        this.loadingGif.style.display = 'none';
    }

    getFilters() {
        return {
            genre: this.genreFilter.value,
            year: this.yearFilter.value,
            rating: this.ratingFilter.value
        };
    }
}

