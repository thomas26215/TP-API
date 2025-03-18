class MovieView {
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
        this.loadingGif.style.display = 'none';

        if (movies.length > 0) {
            movies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');

                const img = document.createElement('img');
                img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'placeholder.png';
                img.alt = movie.title;
                img.style.cursor = 'pointer';

                const title = document.createElement('h3');
                title.textContent = movie.title;

                const year = document.createElement('p');
                year.textContent = `(${new Date(movie.release_date).getFullYear()})`;

                const rating = document.createElement('p');
                rating.textContent = `Note: ${movie.vote_average.toFixed(1)} ⭐`;

                const favoriteButton = document.createElement('button');
                favoriteButton.classList.add('favorite-button');
                this.updateFavoriteButton(favoriteButton, isFavorite(movie.id));

                movieCard.appendChild(img);
                movieCard.appendChild(title);
                movieCard.appendChild(year);
                movieCard.appendChild(rating);
                movieCard.appendChild(favoriteButton);

                this.resultsContainer.appendChild(movieCard);
            });
        } else {
            this.resultsContainer.textContent = '(Aucun résultat trouvé)';
        }
    }

    updateFavoriteButton(button, isFavorite) {
        button.innerHTML = isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        button.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }

    updatePaginationButtons(currentPage, totalPages) {
        this.prevPageButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
        this.nextPageButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    }

    getFilters() {
        return {
            genre: this.genreFilter.value,
            year: this.yearFilter.value,
            rating: this.ratingFilter.value
        };
    }
}
