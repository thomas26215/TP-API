const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const favoritesList = document.getElementById('favorites-list');
const loadingGif = document.getElementById('bloc-gif-attente');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

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
            favoritesList.appendChild(li);
        });
    }
}

function searchMovies(query) {
    loadingGif.style.display = 'block';
    resultsContainer.innerHTML = '';
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=fr-FR`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            loadingGif.style.display = 'none';
            if (data.results && data.results.length > 0) {
                data.results.forEach(movie => {
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

searchInput.addEventListener('input', () => {
    searchButton.disabled = searchInput.value.trim() === '';
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    searchMovies(searchTerm);
});

displayFavorites();

