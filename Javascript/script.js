const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const favoritesList = document.getElementById('favorites-list');
const loadingGif = document.getElementById('bloc-gif-attente');
const genreFilter = document.getElementById('genre-filter');
const yearFilter = document.getElementById('year-filter');
const ratingFilter = document.getElementById('rating-filter');
const applyFiltersButton = document.getElementById('apply-filters');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let genres = [];
let currentPage = 1;
let totalPages = 1;

function loadGenres() {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=fr-FR`)
        .then(response => response.json())
        .then(data => {
            genres = data.genres;
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des genres:', error));
}

function displayFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        const li = document.createElement('li');
        li.textContent = '(Aucune recherche favorite)';
        favoritesList.appendChild(li);
    } else {
        favorites.forEach(favorite => {
            const li = document.createElement('li');
            li.textContent = favorite.title;
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Voulez-vous vraiment supprimer ce favori ?')) {
                    favorites = favorites.filter(f => f.id !== favorite.id);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    displayFavorites();
                }
            });
            li.appendChild(deleteButton);
            li.addEventListener('click', () => {
                searchInput.value = favorite.title;
                searchMovies(favorite.title, getFilters(), 1);
            });
            favoritesList.appendChild(li);
        });
    }
}

function searchMovies(query, filters = {}, page = 1) {
    loadingGif.style.display = 'block';
    resultsContainer.innerHTML = '';
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=fr-FR&page=${page}`;

    if (filters.genre) url += `&with_genres=${filters.genre}`;
    if (filters.year) url += `&year=${filters.year}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingGif.style.display = 'none';
            currentPage = data.page;
            totalPages = data.total_pages;
            updatePaginationButtons();

            if (data.results && data.results.length > 0) {
                let filteredResults = data.results;
                if (filters.rating) {
                    filteredResults = filteredResults.filter(movie => movie.vote_average >= parseFloat(filters.rating));
                }
                filteredResults.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.classList.add('movie-card');

                    const img = document.createElement('img');
                    img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'placeholder.png';
                    img.alt = movie.title;
                    img.addEventListener('click', () => {
                        window.location.href = `movie-details.html?id=${movie.id}`;
                    });
                    img.style.cursor = 'pointer';

                    const title = document.createElement('h3');
                    title.textContent = movie.title;

                    const year = document.createElement('p');
                    year.textContent = `(${new Date(movie.release_date).getFullYear()})`;

                    const rating = document.createElement('p');
                    rating.textContent = `Note: ${movie.vote_average.toFixed(1)} ⭐`;

                    const favoriteButton = document.createElement('button');
                    favoriteButton.classList.add('favorite-button');
                    updateFavoriteButton(favoriteButton, movie);

                    favoriteButton.addEventListener('click', () => {
                        toggleFavorite(movie);
                        updateFavoriteButton(favoriteButton, movie);
                    });

                    movieCard.appendChild(img);
                    movieCard.appendChild(title);
                    movieCard.appendChild(year);
                    movieCard.appendChild(rating);
                    movieCard.appendChild(favoriteButton);

                    resultsContainer.appendChild(movieCard);
                });
            } else {
                resultsContainer.textContent = '(Aucun résultat trouvé)';
            }
        })
        .catch(error => {
            loadingGif.style.display = 'none';
            resultsContainer.textContent = 'Erreur lors de la recherche.';
            console.error(error);
        });
}

function updateFavoriteButton(button, movie) {
    const isFavorite = favorites.some(fav => fav.id === movie.id);
    button.innerHTML = isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    button.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

function toggleFavorite(movie) {
    const index = favorites.findIndex(fav => fav.id === movie.id);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({ id: movie.id, title: movie.title });
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function getFilters() {
    return {
        genre: genreFilter.value,
        year: yearFilter.value,
        rating: ratingFilter.value
    };
}

function updatePaginationButtons() {
    prevPageButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
    nextPageButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
}

searchInput.addEventListener('input', () => {
    searchButton.disabled = searchInput.value.trim() === '';
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    const filters = getFilters();
    searchMovies(searchTerm, filters, 1);
});

applyFiltersButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        const filters = getFilters();
        searchMovies(searchTerm, filters, 1);
    }
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        const searchTerm = searchInput.value.trim();
        const filters = getFilters();
        searchMovies(searchTerm, filters, currentPage - 1);
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        const searchTerm = searchInput.value.trim();
        const filters = getFilters();
        searchMovies(searchTerm, filters, currentPage + 1);
    }
});

loadGenres();
displayFavorites();

