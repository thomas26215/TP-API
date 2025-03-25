// view.js
export const View = {
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    resultsContainer: document.getElementById('results-container'),
    favoritesList: document.getElementById('favorites-list'),
    loadingGif: document.getElementById('bloc-gif-attente'),
    genreFilter: document.getElementById('genre-filter'),
    yearFilter: document.getElementById('year-filter'),
    ratingFilter: document.getElementById('rating-filter'),
    applyFiltersButton: document.getElementById('apply-filters'),
    prevPageButton: document.getElementById('prev-page'),
    nextPageButton: document.getElementById('next-page'),
    notification: document.getElementById('notification'),
    homeLink: document.getElementById('home-link'),
    movieLink: document.getElementById('movie-link'),
    seriesLink: document.getElementById('series-link'),
    suggestionsContainer: document.createElement('div'), // Conteneur pour les suggestions
    pageInfo: document.getElementById('page-info'),
    callbacks: {},

    init: function(callbacks) {
        this.callbacks = callbacks;
        // Ajout du conteneur des suggestions
        this.suggestionsContainer.id = 'suggestions-container';
        this.suggestionsContainer.style.position = 'absolute';
        this.suggestionsContainer.style.top = '100%';
        this.suggestionsContainer.style.left = '0';
        this.suggestionsContainer.style.width = '100%';
        this.suggestionsContainer.style.backgroundColor = 'white';
        this.suggestionsContainer.style.border = '1px solid #ccc';
        this.suggestionsContainer.style.borderRadius = '5px';
        this.suggestionsContainer.style.zIndex = '10';
        this.suggestionsContainer.style.display = 'none'; // Cacher par défaut
        this.searchInput.parentNode.appendChild(this.suggestionsContainer);
    },

    // Afficher les genres dans le selecteur
    displayGenres: function(genres) {
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            this.genreFilter.appendChild(option);
        });
    },

    // Afficher les favoris
    displayFavorites: function(favorites) {
        this.favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            const li = document.createElement('li');
            li.textContent = '(Aucun favori)';
            this.favoritesList.appendChild(li);
        } else {
            favorites.forEach(favorite => {
                const li = document.createElement('li');
                li.textContent = favorite.title;
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-times"></i>';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.callbacks.removeFavorite(favorite);
                });
                li.appendChild(deleteButton);
                li.addEventListener('click', () => {
                    this.searchInput.value = favorite.title;
                    this.callbacks.searchMovies(favorite.title, this.callbacks.getFilters(), 1);
                });
                this.favoritesList.appendChild(li);
            });
        }
    },

    // Afficher les résultats de la recherche
    displayResults: function(results) {
        this.resultsContainer.innerHTML = '';
        results.forEach(item => {
            const movieCard = this.createMovieCard(item);
            this.resultsContainer.appendChild(movieCard);
        });
    },

    // Afficher les suggestions
    displaySuggestions: function(suggestions) {
        this.suggestionsContainer.innerHTML = ''; // Effacer les anciennes suggestions
        if (suggestions.length > 0) {
            suggestions.forEach(item => {
                const suggestionElement = document.createElement('div');
                suggestionElement.style.padding = '8px';
                suggestionElement.style.cursor = 'pointer';
                suggestionElement.textContent = item.title || item.name;
                suggestionElement.addEventListener('click', () => {
                    this.searchInput.value = item.title || item.name;
                    this.callbacks.searchMovies(item.title || item.name, this.callbacks.getFilters(), 1);
                    this.suggestionsContainer.style.display = 'none'; // Cacher les suggestions après la sélection
                });
                this.suggestionsContainer.appendChild(suggestionElement);
            });
            this.suggestionsContainer.style.display = 'block'; // Afficher le conteneur
        } else {
            this.suggestionsContainer.style.display = 'none'; // Cacher si aucune suggestion
        }
    },

    // Mettre à jour le bouton des favoris
    updateFavoriteButton: function(button, item) {
        const isFavorite = this.callbacks.isFavorite(item);
        button.innerHTML = isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        button.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
    },

    // Créer une carte de film/série
    createMovieCard: function(item) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const img = document.createElement('img');
        img.src = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'placeholder.png';
        img.alt = item.title || item.name;
        img.style.cursor = 'pointer';

        img.addEventListener('click', () => {
            window.location.href = `movie-details.html?id=${item.id}&media_type=${item.media_type}`;
        });

        const title = document.createElement('h3');
        title.textContent = `${item.title || item.name} ${item.media_type === 'tv' ? '(Série)' : ''}`;

        const year = document.createElement('p');
        year.textContent = `(${new Date(item.release_date || item.first_air_date).getFullYear()})`;

        const rating = document.createElement('p');
        rating.textContent = `Note: ${item.vote_average.toFixed(1)} ⭐`;

        const favoriteButton = document.createElement('button');
        favoriteButton.classList.add('favorite-button');
        this.updateFavoriteButton(favoriteButton, item);

        favoriteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.callbacks.toggleFavorite(item);
        });

        movieCard.appendChild(img);
        movieCard.appendChild(title);
        movieCard.appendChild(year);
        movieCard.appendChild(rating);
        movieCard.appendChild(favoriteButton);

        return movieCard;
    },

    // Afficher une notification
    showNotification: function(message) {
        this.notification.textContent = message;
        this.notification.classList.add('show'); // Ajoute la classe pour afficher
        setTimeout(() => {
            this.notification.classList.remove('show'); // Retire la classe pour cacher
        }, 3000); // Disparaît après 3 secondes
    },

    // Activer/désactiver l'indicateur de chargement
    toggleLoading: function(show) {
        this.loadingGif.style.display = show ? 'block' : 'none';
    },

    // Mettre à jour les boutons de pagination
    updatePaginationButtons: function(currentPage, totalPages, currentSearchTerm) {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        // Effacer les anciens numéros de page
        pageInfo.innerHTML = '';

        // Afficher "Page X sur Y"
        const pageCountText = document.createElement('span');
        pageCountText.textContent = `Page ${currentPage} sur ${totalPages}`;
        pageInfo.appendChild(pageCountText);

        // Afficher les numéros de page cliquables (limité à 5 pour simplifier)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Ajuster startPage et endPage si nécessaire pour toujours afficher 5 numéros
        if (totalPages <= 5) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage - 2 < 1) {
                endPage = 5;
            } else if (currentPage + 2 > totalPages) {
                startPage = totalPages - 4;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.textContent = i;
            pageNumber.classList.add('page-number');
            if (i === currentPage) {
                pageNumber.classList.add('active');
            }
            pageNumber.addEventListener('click', () => {
                this.callbacks.handlePageChange(i, currentSearchTerm);
            });
            pageInfo.appendChild(pageNumber);
        }

        // Afficher ou masquer les boutons "Précédent" et "Suivant"
        prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
        nextButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    },

    // Activer le lien de menu actif
    setActiveLink: function(link) {
        document.querySelectorAll('.header-menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    }
};

