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
const notification = document.getElementById('notification');
const homeLink = document.getElementById('home-link');
const movieLink = document.getElementById('movie-link');
const seriesLink = document.getElementById('series-link');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let genres = [];
let currentPage = 1;
let totalPages = 1;
let currentMediaType = 'all'; // 'all', 'movie', ou 'tv'
let currentSearchTerm = '';  // Stocker le terme de recherche actuel

// Initialisation des genres au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await loadGenres();
    displayFavorites();

    // Gestion des clics sur les liens du menu
    homeLink.addEventListener('click', (e) => handleMediaTypeClick(e, 'all'));
    movieLink.addEventListener('click', (e) => handleMediaTypeClick(e, 'movie'));
    seriesLink.addEventListener('click', (e) => handleMediaTypeClick(e, 'tv'));

    // Activer le lien "Accueil" par défaut
    setActiveLink(homeLink);

    // Désactiver le bouton de recherche initialement
    searchButton.disabled = true;

    // Afficher tous les films au chargement de la page
    await fetchTrendingMovies();
}

// Chargement des genres depuis l'API
async function loadGenres() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=fr-FR`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        genres = data.genres || [];
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des genres:', error);
        showNotification('Erreur lors du chargement des genres.');
    }
}

// Affichage des favoris
function displayFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        const li = document.createElement('li');
        li.textContent = '(Aucun favori)';
        favoritesList.appendChild(li);
    } else {
        favorites.forEach(favorite => {
            const li = document.createElement('li');
            li.textContent = favorite.title;
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                favorites = favorites.filter(f => f.id !== favorite.id || f.media_type !== favorite.media_type);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                displayFavorites();
                showNotification('Favori supprimé !');
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

// Recherche de films/séries
async function searchMovies(query, filters = {}, page = 1) {
    loadingGif.style.display = 'block';
    resultsContainer.innerHTML = '';
    currentSearchTerm = query;

    let url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}&language=fr-FR&page=${page}`;

    if (filters.genre) url += `&with_genres=${filters.genre}`;
    if (filters.year) url += `&year=${filters.year}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        loadingGif.style.display = 'none';
        currentPage = data.page;
        totalPages = data.total_pages;
        updatePaginationButtons();

        if (data.results && data.results.length > 0) {
            let filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

            if (currentMediaType !== 'all') {
                filteredResults = filteredResults.filter(item => item.media_type === currentMediaType);
            }

            if (filters.rating) {
                filteredResults = filteredResults.filter(item => item.vote_average >= parseFloat(filters.rating));
            }
            displayResults(filteredResults);
        } else {
            resultsContainer.textContent = '(Aucun résultat trouvé)';
        }
    } catch (error) {
        loadingGif.style.display = 'none';
        resultsContainer.textContent = 'Erreur lors de la recherche.';
        console.error(error);
        showNotification('Erreur lors de la recherche.');
    }
}

// Afficher les films populaires (sans recherche)
async function fetchTrendingMovies(page = 1) {
    loadingGif.style.display = 'block';
    resultsContainer.innerHTML = '';
    currentSearchTerm = '';  // Effacer le terme de recherche

    let url = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=fr-FR&page=${page}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        loadingGif.style.display = 'none';
        currentPage = data.page;
        totalPages = data.total_pages;
        updatePaginationButtons();

        if (data.results && data.results.length > 0) {
            let filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

            if (currentMediaType !== 'all') {
                filteredResults = filteredResults.filter(item => item.media_type === currentMediaType);
            }

            displayResults(filteredResults);
        } else {
            resultsContainer.textContent = '(Aucun résultat trouvé)';
        }
    } catch (error) {
        loadingGif.style.display = 'none';
        resultsContainer.textContent = 'Erreur lors du chargement des films populaires.';
        console.error(error);
        showNotification('Erreur lors du chargement des films populaires.');
    }
}

function displayResults(results) {
    resultsContainer.innerHTML = '';
    results.forEach(item => {
        const movieCard = createMovieCard(item);
        resultsContainer.appendChild(movieCard);
    });
}

// Mettre à jour le bouton des favoris
function updateFavoriteButton(button, item) {
    const isFavorite = favorites.some(fav => fav.id === item.id && fav.media_type === item.media_type);
    button.innerHTML = isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    button.title = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

// Basculer l'état de favori
function toggleFavorite(item) {
    const index = favorites.findIndex(fav => fav.id === item.id && fav.media_type === item.media_type);
    if (index !== -1) {
        favorites.splice(index, 1);
        showNotification('Retiré des favoris');
    } else {
        favorites.push({ id: item.id, title: item.title || item.name, media_type: item.media_type });
        showNotification('Ajouté aux favoris');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Récupérer les filtres
function getFilters() {
    return {
        genre: genreFilter.value,
        year: yearFilter.value,
        rating: ratingFilter.value
    };
}

// Mettre à jour la pagination
function updatePaginationButtons() {
    prevPageButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
    nextPageButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';

    const pageInfo = document.getElementById('page-info');
    pageInfo.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    function createPageButton(pageNum) {
        const pageNumber = document.createElement('span');
        pageNumber.classList.add('page-number');
        pageNumber.textContent = pageNum;
        if (pageNum === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', () => {
            if (pageNum !== currentPage) {
                currentPage = pageNum;
                if (currentSearchTerm) {
                    const filters = getFilters();
                    searchMovies(currentSearchTerm, filters, currentPage);
                } else {
                    fetchTrendingMovies(currentPage);
                }
            }
        });
        return pageNumber;
    }

    if (startPage > 1) {
        pageInfo.appendChild(createPageButton(1));
        if (startPage > 2) {
            pageInfo.appendChild(document.createTextNode('...'));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageInfo.appendChild(createPageButton(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageInfo.appendChild(document.createTextNode('...'));
        }
        pageInfo.appendChild(createPageButton(totalPages));
    }
}

// Afficher une notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show'); // Ajoute la classe pour afficher
    setTimeout(() => {
        notification.classList.remove('show'); // Retire la classe pour cacher
        setTimeout(() => {
            notification.textContent = ''; // Efface le texte après la transition
        }, 500); // Attendre la fin de la transition de disparition
    }, 3000);
}

// Gérer le clic sur les liens du menu
function handleMediaTypeClick(event, mediaType) {
    event.preventDefault();
    currentMediaType = mediaType;

    if (searchInput.value.trim()) {
        const filters = getFilters();
        searchMovies(searchInput.value.trim(), filters, 1);
    } else {
        fetchTrendingMovies();
    }

    setActiveLink(event.target);
}

// Activer le lien du menu
function setActiveLink(link) {
    document.querySelectorAll('.header-menu li a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
}

// Créer une carte de film/série
function createMovieCard(item) {
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
    updateFavoriteButton(favoriteButton, item);

    favoriteButton.addEventListener('click', () => {
        toggleFavorite(item);
        updateFavoriteButton(favoriteButton, item);
    });

    movieCard.appendChild(img);
    movieCard.appendChild(title);
    movieCard.appendChild(year);
    movieCard.appendChild(rating);
    movieCard.appendChild(favoriteButton);

    return movieCard;
}

// Écouteurs d'événements
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
        if (currentSearchTerm) {
            const filters = getFilters();
            searchMovies(currentSearchTerm, filters, currentPage + 1);
        } else {
            fetchTrendingMovies(currentPage + 1);
        }
    }
});

