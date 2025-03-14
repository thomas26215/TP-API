const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const favoritesList = document.getElementById('favorites-list');
const loadingGif = document.getElementById('bloc-gif-attente');
const suggestionsContainer = document.getElementById('suggestions');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

let currentPage = 1;
let totalPages = 0;
let currentQuery = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Fonction pour afficher les favoris
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
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm('Voulez-vous vraiment supprimer ce favori ?')) {
                    favorites = favorites.filter(f => f.id !== favorite.id);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    displayFavorites();
                }
            });
            li.appendChild(deleteButton);
            li.addEventListener('click', () => {
                searchInput.value = favorite.title;
                searchMovies(favorite.title);
            });
            favoritesList.appendChild(li);
        });
    }
}

// Fonction pour rechercher des films
function searchMovies(query, page = 1) {
    loadingGif.style.display = 'block';
    resultsContainer.innerHTML = '';
    currentQuery = query;
    currentPage = page;

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=fr-FR&page=${page}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingGif.style.display = 'none';
            totalPages = data.total_pages;
            updatePaginationButtons();

            if (data.results && data.results.length > 0) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
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

// Fonction pour créer une carte de film
function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const img = document.createElement('img');
    img.src = movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'placeholder.png';
    img.alt = movie.title;

    const title = document.createElement('h3');
    title.textContent = movie.title;

    const year = document.createElement('p');
    year.textContent = `(${new Date(movie.release_date).getFullYear()})`;

    const favoriteButton = document.createElement('button');
    favoriteButton.innerHTML = favorites.some(f => f.id === movie.id) ? '★' : '☆';
    favoriteButton.addEventListener('click', () => toggleFavorite(movie));

    movieCard.appendChild(img);
    movieCard.appendChild(title);
    movieCard.appendChild(year);
    movieCard.appendChild(favoriteButton);

    return movieCard;
}

// Fonction pour basculer un film en favori
function toggleFavorite(movie) {
    const index = favorites.findIndex(f => f.id === movie.id);
    if (index === -1) {
        f

